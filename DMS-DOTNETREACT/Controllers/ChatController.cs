using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.SignalR;
using DMS_DOTNETREACT.Hubs;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly IHubContext<ChatHub> _hub;

    public ChatController(ClinicDbContext context, IHubContext<ChatHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    private async Task<object> GetUnreadSummaryForPatientUser(int userId)
    {
        var patient = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);
        if (patient == null)
        {
            return new { unreadMessages = 0, unreadConversations = 0 };
        }

        var conversationIds = await _context.ChatConversations
            .AsNoTracking()
            .Where(c => c.PatientId == patient.Id && c.Status != "closed")
            .Select(c => c.Id)
            .ToListAsync();

        var unreadMessages = await _context.ChatMessages
            .AsNoTracking()
            .CountAsync(m => conversationIds.Contains(m.ConversationId) && m.ReadAt == null && m.SenderRole == "secretary");

        var unreadConversations = await _context.ChatConversations
            .AsNoTracking()
            .Where(c => conversationIds.Contains(c.Id))
            .CountAsync(c => c.Messages.Any(m => m.ReadAt == null && m.SenderRole == "secretary"));

        return new { unreadMessages, unreadConversations };
    }

    private async Task<object> GetUnreadSummaryForSecretaryUser(int userId)
    {
        var secretary = await _context.Secretaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);
        if (secretary == null)
        {
            return new { unreadMessages = 0, unreadConversations = 0 };
        }

        var conversationIds = await _context.ChatConversations
            .AsNoTracking()
            .Where(c => c.Status != "closed" && (c.AssignedSecretaryId == secretary.Id || c.Status == "waiting"))
            .Select(c => c.Id)
            .ToListAsync();

        var unreadMessages = await _context.ChatMessages
            .AsNoTracking()
            .CountAsync(m => conversationIds.Contains(m.ConversationId) && m.ReadAt == null && m.SenderRole == "patient");

        var unreadConversations = await _context.ChatConversations
            .AsNoTracking()
            .Where(c => conversationIds.Contains(c.Id))
            .CountAsync(c => c.Messages.Any(m => m.ReadAt == null && m.SenderRole == "patient"));

        return new { unreadMessages, unreadConversations };
    }

    private bool TryGetUserId(out int userId)
    {
        userId = 0;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst(ClaimTypes.Name)?.Value;
        if (userIdClaim == null) return false;
        return int.TryParse(userIdClaim, out userId);
    }

    private static object ToMessageDto(ChatMessage m) => new
    {
        m.Id,
        m.ConversationId,
        m.SenderUserId,
        m.SenderRole,
        m.Text,
        m.SentAt,
        m.ReadAt
    };

    private static object ToConversationDto(ChatConversation c) => new
    {
        c.Id,
        c.PatientId,
        PatientName = c.Patient.FullName,
        c.AssignedSecretaryId,
        c.Status,
        c.CreatedAt,
        c.ClosedAt,
        LastMessageAt = c.Messages.OrderByDescending(x => x.SentAt).Select(x => (DateTime?)x.SentAt).FirstOrDefault(),
        UnreadCount = c.Messages.Count(m => m.ReadAt == null && m.SenderRole == "patient")
    };

    private static string GetUserRole(ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.Role)?.Value?.ToLowerInvariant() ?? string.Empty;

    public class StartChatResponse
    {
        public int ConversationId { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool HasSecretary { get; set; }
        public string? InfoMessage { get; set; }
    }

    public class SendMessageRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    public class MarkReadResponse
    {
        public int ConversationId { get; set; }
        public int MarkedCount { get; set; }
    }

    [HttpPost("start")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult<StartChatResponse>> StartChat()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);
        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

        var existing = await _context.ChatConversations
            .Include(c => c.Messages)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(c => c.PatientId == patient.Id && c.Status != "closed");

        if (existing != null)
        {
            return Ok(new StartChatResponse
            {
                ConversationId = existing.Id,
                Status = existing.Status,
                HasSecretary = existing.AssignedSecretaryId.HasValue,
                InfoMessage = existing.AssignedSecretaryId.HasValue ? null : "No secretary available, please leave a message"
            });
        }

        // Ticket-style: create conversation even if no secretary is available.
        // If a secretary is available, assign it.
        var availableSecretaryId = await _context.SecretaryAvailabilities
            .Where(a => a.IsAvailable)
            .OrderBy(a => a.UpdatedAt)
            .Select(a => (int?)a.SecretaryId)
            .FirstOrDefaultAsync();

        var conversation = new ChatConversation
        {
            PatientId = patient.Id,
            AssignedSecretaryId = availableSecretaryId,
            Status = availableSecretaryId.HasValue ? "open" : "waiting",
            CreatedAt = DateTime.UtcNow
        };

        _context.ChatConversations.Add(conversation);
        await _context.SaveChangesAsync();

        return Ok(new StartChatResponse
        {
            ConversationId = conversation.Id,
            Status = conversation.Status,
            HasSecretary = conversation.AssignedSecretaryId.HasValue,
            InfoMessage = conversation.AssignedSecretaryId.HasValue ? null : "No secretary available, please leave a message"
        });
    }

    [HttpGet("conversations/{conversationId:int}/messages")]
    public async Task<ActionResult> GetMessages([FromRoute] int conversationId)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var userRole = GetUserRole(User);

        var conversation = await _context.ChatConversations
            .Include(c => c.Patient)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            return NotFound("Conversation not found");
        }

        if (userRole == "patient")
        {
            var patient = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null || conversation.PatientId != patient.Id)
            {
                return Forbid();
            }
        }
        else if (userRole == "secretary")
        {
            var secretary = await _context.Secretaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);
            if (secretary == null)
            {
                return Forbid();
            }

            // secretary can see waiting conversations OR conversations assigned to them
            if (conversation.AssignedSecretaryId.HasValue && conversation.AssignedSecretaryId.Value != secretary.Id && conversation.Status != "waiting")
            {
                return Forbid();
            }
        }
        else
        {
            return Forbid();
        }

        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(messages.Select(ToMessageDto));
    }

    [HttpPost("conversations/{conversationId:int}/read")]
    public async Task<ActionResult<MarkReadResponse>> MarkConversationRead([FromRoute] int conversationId)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var userRole = GetUserRole(User);

        var conversation = await _context.ChatConversations
            .Include(c => c.Patient)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            return NotFound("Conversation not found");
        }

        if (userRole == "patient")
        {
            var patient = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null || conversation.PatientId != patient.Id)
            {
                return Forbid();
            }
        }
        else if (userRole == "secretary")
        {
            var secretary = await _context.Secretaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);
            if (secretary == null)
            {
                return Forbid();
            }

            if (conversation.AssignedSecretaryId.HasValue && conversation.AssignedSecretaryId.Value != secretary.Id && conversation.Status != "waiting")
            {
                return Forbid();
            }
        }
        else
        {
            return Forbid();
        }

        var now = DateTime.UtcNow;
        var toMark = await _context.ChatMessages
            .Where(m => m.ConversationId == conversationId && m.ReadAt == null && m.SenderRole != userRole)
            .ToListAsync();

        foreach (var msg in toMark)
        {
            msg.ReadAt = now;
        }

        await _context.SaveChangesAsync();

        if (userRole == "patient")
        {
            await _hub.Clients.Group($"user:{userId}")
                .SendAsync("chat:unread", await GetUnreadSummaryForPatientUser(userId));

            if (conversation.AssignedSecretaryId.HasValue)
            {
                var secretaryUserId = await _context.Secretaries
                    .AsNoTracking()
                    .Where(s => s.Id == conversation.AssignedSecretaryId.Value)
                    .Select(s => s.UserId)
                    .FirstOrDefaultAsync();

                if (secretaryUserId > 0)
                {
                    await _hub.Clients.Group($"user:{secretaryUserId}")
                        .SendAsync("chat:unread", await GetUnreadSummaryForSecretaryUser(secretaryUserId));
                }
            }
        }
        else if (userRole == "secretary")
        {
            await _hub.Clients.Group($"user:{userId}")
                .SendAsync("chat:unread", await GetUnreadSummaryForSecretaryUser(userId));

            var patientUserId = await _context.Patients
                .AsNoTracking()
                .Where(p => p.Id == conversation.PatientId)
                .Select(p => p.UserId)
                .FirstOrDefaultAsync();

            if (patientUserId > 0)
            {
                await _hub.Clients.Group($"user:{patientUserId}")
                    .SendAsync("chat:unread", await GetUnreadSummaryForPatientUser(patientUserId));
            }
        }

        return Ok(new MarkReadResponse { ConversationId = conversationId, MarkedCount = toMark.Count });
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult> GetUnreadCount()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var userRole = GetUserRole(User);

        if (userRole == "secretary")
        {
            var secretary = await _context.Secretaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);
            if (secretary == null)
            {
                return NotFound("Secretary profile not found");
            }

            var conversationIds = await _context.ChatConversations
                .AsNoTracking()
                .Where(c => c.Status != "closed" && (c.AssignedSecretaryId == secretary.Id || c.Status == "waiting"))
                .Select(c => c.Id)
                .ToListAsync();

            var unreadMessages = await _context.ChatMessages
                .AsNoTracking()
                .CountAsync(m => conversationIds.Contains(m.ConversationId) && m.ReadAt == null && m.SenderRole == "patient");

            var unreadConversations = await _context.ChatConversations
                .AsNoTracking()
                .Where(c => conversationIds.Contains(c.Id))
                .CountAsync(c => c.Messages.Any(m => m.ReadAt == null && m.SenderRole == "patient"));

            return Ok(new { unreadMessages, unreadConversations });
        }

        if (userRole == "patient")
        {
            var patient = await _context.Patients.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null)
            {
                return NotFound("Patient profile not found");
            }

            var conversationIds = await _context.ChatConversations
                .AsNoTracking()
                .Where(c => c.PatientId == patient.Id && c.Status != "closed")
                .Select(c => c.Id)
                .ToListAsync();

            var unreadMessages = await _context.ChatMessages
                .AsNoTracking()
                .CountAsync(m => conversationIds.Contains(m.ConversationId) && m.ReadAt == null && m.SenderRole == "secretary");

            var unreadConversations = await _context.ChatConversations
                .AsNoTracking()
                .Where(c => conversationIds.Contains(c.Id))
                .CountAsync(c => c.Messages.Any(m => m.ReadAt == null && m.SenderRole == "secretary"));

            return Ok(new { unreadMessages, unreadConversations });
        }

        return Forbid();
    }

    [HttpPost("conversations/{conversationId:int}/messages")]
    public async Task<ActionResult> SendMessage([FromRoute] int conversationId, [FromBody] SendMessageRequest req)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        if (string.IsNullOrWhiteSpace(req.Text))
        {
            return BadRequest("Message text is required");
        }

        var role = User.FindFirst(ClaimTypes.Role)?.Value?.ToLowerInvariant() ?? string.Empty;

        var conversation = await _context.ChatConversations
            .Include(c => c.Patient)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            return NotFound("Conversation not found");
        }

        if (role == "patient")
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null || conversation.PatientId != patient.Id)
            {
                return Forbid();
            }
        }
        else if (role == "secretary")
        {
            var secretary = await _context.Secretaries.FirstOrDefaultAsync(s => s.UserId == userId);
            if (secretary == null)
            {
                return Forbid();
            }

            // If waiting, first secretary to reply "claims" it
            if (!conversation.AssignedSecretaryId.HasValue)
            {
                conversation.AssignedSecretaryId = secretary.Id;
                conversation.Status = "open";
            }
            else if (conversation.AssignedSecretaryId.Value != secretary.Id)
            {
                return Forbid();
            }
        }
        else
        {
            return Forbid();
        }

        if (conversation.Status == "closed")
        {
            return BadRequest("Conversation is closed");
        }

        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderUserId = userId,
            SenderRole = role,
            Text = req.Text.Trim(),
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        var msgDto = ToMessageDto(message);
        await _hub.Clients.Group($"conv:{conversationId}").SendAsync("chat:message", msgDto);

        var patientUserId = await _context.Patients
            .AsNoTracking()
            .Where(p => p.Id == conversation.PatientId)
            .Select(p => p.UserId)
            .FirstOrDefaultAsync();
        if (patientUserId > 0)
        {
            await _hub.Clients.Group($"user:{patientUserId}")
                .SendAsync("chat:unread", await GetUnreadSummaryForPatientUser(patientUserId));
        }

        if (conversation.AssignedSecretaryId.HasValue)
        {
            var secretaryUserId = await _context.Secretaries
                .AsNoTracking()
                .Where(s => s.Id == conversation.AssignedSecretaryId.Value)
                .Select(s => s.UserId)
                .FirstOrDefaultAsync();

            if (secretaryUserId > 0)
            {
                await _hub.Clients.Group($"user:{secretaryUserId}")
                    .SendAsync("chat:unread", await GetUnreadSummaryForSecretaryUser(secretaryUserId));
            }
        }

        return Ok(msgDto);
    }

    [HttpGet("secretary/inbox")]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> GetSecretaryInbox([FromQuery] string tab = "open")
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var secretary = await _context.Secretaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);
        if (secretary == null)
        {
            return NotFound("Secretary profile not found");
        }

        var query = _context.ChatConversations
            .Include(c => c.Patient)
            .Include(c => c.Messages)
            .AsNoTracking()
            .AsQueryable();

        tab = (tab ?? "open").ToLowerInvariant();

        if (tab == "waiting")
        {
            query = query.Where(c => c.Status == "waiting");
        }
        else if (tab == "closed")
        {
            query = query.Where(c => c.Status == "closed" && c.AssignedSecretaryId == secretary.Id);
        }
        else
        {
            // open
            query = query.Where(c => c.Status != "closed" && (c.AssignedSecretaryId == secretary.Id || c.Status == "waiting"));
        }

        var items = await query
            .OrderByDescending(c => c.Messages.OrderByDescending(m => m.SentAt).Select(m => m.SentAt).FirstOrDefault())
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(items.Select(ToConversationDto));
    }

    [HttpPost("secretary/availability")]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> SetSecretaryAvailability([FromQuery] bool isAvailable)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized("Invalid token");
        }

        var secretary = await _context.Secretaries.FirstOrDefaultAsync(s => s.UserId == userId);
        if (secretary == null)
        {
            return NotFound("Secretary profile not found");
        }

        var row = await _context.SecretaryAvailabilities.FirstOrDefaultAsync(a => a.SecretaryId == secretary.Id);
        if (row == null)
        {
            row = new SecretaryAvailability
            {
                SecretaryId = secretary.Id,
                IsAvailable = isAvailable,
                UpdatedAt = DateTime.UtcNow
            };
            _context.SecretaryAvailabilities.Add(row);
        }
        else
        {
            row.IsAvailable = isAvailable;
            row.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { row.SecretaryId, row.IsAvailable, row.UpdatedAt });
    }
}
