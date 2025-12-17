using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly EmailService _emailService;
    private readonly AuditService _auditService;

    public NotificationsController(ClinicDbContext context, EmailService emailService, AuditService auditService)
    {
        _context = context;
        _emailService = emailService;
        _auditService = auditService;
    }

    [HttpPost("send-reminder")]
    [Authorize]
    public async Task<ActionResult> SendReminder([FromBody] ReminderRequest request)
    {
        try
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId);

            if (appointment == null) 
            {
                return NotFound(new { message = "Appointment not found" });
            }

            var patientEmail = appointment.Patient?.User?.Email;
            if (string.IsNullOrEmpty(patientEmail))
            {
                return BadRequest(new { message = "Patient has no email address configured." });
            }

            // Try to use email template if available
            var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Name == "AppointmentReminder");
            string subject;
            string body;

            if (template != null)
            {
                subject = template.Subject;
                body = template.Body
                    .Replace("{{FullName}}", appointment.Patient.FullName)
                    .Replace("{{Date}}", appointment.AppointmentDate.ToString("d"))
                    .Replace("{{Time}}", appointment.AppointmentTime.ToString())
                    .Replace("{{DoctorName}}", appointment.Doctor.FullName);
            }
            else
            {
                // Fallback to default template
                subject = $"Appointment Reminder: {appointment.AppointmentDate:d} at {appointment.AppointmentTime}";
                body = $@"
                    <h3>Appointment Reminder</h3>
                    <p>Dear {appointment.Patient.FullName},</p>
                    <p>This is a reminder for your upcoming appointment with Dr. {appointment.Doctor.FullName}.</p>
                    <p><strong>Date:</strong> {appointment.AppointmentDate:d}</p>
                    <p><strong>Time:</strong> {appointment.AppointmentTime}</p>
                    <p>Please arrive 10 minutes early.</p>
                    <br/>
                    <p>Thank you,</p>
                    <p>Clinic Team</p>
                ";
            }

            await _emailService.SendEmailAsync(patientEmail, subject, body);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _auditService.LogActionAsync(userId, "REMINDER_SENT", $"Manual reminder sent to {patientEmail} for appointment #{appointment.Id}");

            return Ok(new { message = "Email reminder sent successfully", email = patientEmail });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SendReminder] Error: {ex.Message}");
            Console.WriteLine($"[SendReminder] StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = $"Failed to send email reminder: {ex.Message}" });
        }
    }

    [HttpPost("send-reminders-bulk")]
    [Authorize]
    public async Task<ActionResult> SendRemindersBulk([FromBody] BulkReminderRequest request)
    {
        try
        {
            if (request.AppointmentIds == null || request.AppointmentIds.Count == 0)
            {
                return BadRequest(new { message = "No appointment IDs provided" });
            }

            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                .Where(a => request.AppointmentIds.Contains(a.Id))
                .ToListAsync();

            if (appointments.Count == 0)
            {
                return NotFound(new { message = "No appointments found" });
            }

            var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Name == "AppointmentReminder");
            var results = new List<ReminderResult>();
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            foreach (var appointment in appointments)
            {
                var result = new ReminderResult
                {
                    AppointmentId = appointment.Id,
                    PatientName = appointment.Patient?.FullName ?? "Unknown"
                };

                try
                {
                    var patientEmail = appointment.Patient?.User?.Email;
                    if (string.IsNullOrEmpty(patientEmail))
                    {
                        result.Success = false;
                        result.Message = "Patient has no email address configured";
                        results.Add(result);
                        continue;
                    }

                    string subject;
                    string body;

                    if (template != null)
                    {
                        subject = template.Subject;
                        body = template.Body
                            .Replace("{{FullName}}", appointment.Patient.FullName)
                            .Replace("{{Date}}", appointment.AppointmentDate.ToString("d"))
                            .Replace("{{Time}}", appointment.AppointmentTime.ToString())
                            .Replace("{{DoctorName}}", appointment.Doctor.FullName);
                    }
                    else
                    {
                        subject = $"Appointment Reminder: {appointment.AppointmentDate:d} at {appointment.AppointmentTime}";
                        body = $@"
                            <h3>Appointment Reminder</h3>
                            <p>Dear {appointment.Patient.FullName},</p>
                            <p>This is a reminder for your upcoming appointment with Dr. {appointment.Doctor.FullName}.</p>
                            <p><strong>Date:</strong> {appointment.AppointmentDate:d}</p>
                            <p><strong>Time:</strong> {appointment.AppointmentTime}</p>
                            <p>Please arrive 10 minutes early.</p>
                            <br/>
                            <p>Thank you,</p>
                            <p>Clinic Team</p>
                        ";
                    }

                    await _emailService.SendEmailAsync(patientEmail, subject, body);
                    await _auditService.LogActionAsync(userId, "REMINDER_SENT", $"Bulk reminder sent to {patientEmail} for appointment #{appointment.Id}");

                    result.Success = true;
                    result.Message = "Reminder sent successfully";
                    result.Email = patientEmail;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[SendRemindersBulk] Error for appointment {appointment.Id}: {ex.Message}");
                    result.Success = false;
                    result.Message = $"Failed to send: {ex.Message}";
                }

                results.Add(result);
            }

            var successCount = results.Count(r => r.Success);
            var failureCount = results.Count(r => !r.Success);

            return Ok(new
            {
                message = $"Processed {appointments.Count} appointments. {successCount} succeeded, {failureCount} failed.",
                total = appointments.Count,
                succeeded = successCount,
                failed = failureCount,
                results = results
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SendRemindersBulk] Error: {ex.Message}");
            Console.WriteLine($"[SendRemindersBulk] StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = $"Failed to send bulk reminders: {ex.Message}" });
        }
    }
}

public class ReminderRequest
{
    [JsonPropertyName("appointmentId")]
    public int AppointmentId { get; set; }
}

public class BulkReminderRequest
{
    [JsonPropertyName("appointmentIds")]
    public List<int> AppointmentIds { get; set; } = new();
}

public class ReminderResult
{
    [JsonPropertyName("appointmentId")]
    public int AppointmentId { get; set; }

    [JsonPropertyName("patientName")]
    public string PatientName { get; set; } = string.Empty;

    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }
}
