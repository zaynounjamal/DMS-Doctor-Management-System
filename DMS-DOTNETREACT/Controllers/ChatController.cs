using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public ChatController(ClinicDbContext context)
    {
        _context = context;
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
        LastMessageAt = c.Messages.OrderByDescending(x => x.SentAt).Select(x => (DateTime?)x.SentAt).FirstOrDefault()
    };

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

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToLowerInvariant();

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

        return Ok(ToMessageDto(message));
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
