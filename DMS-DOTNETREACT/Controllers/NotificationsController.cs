using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
                .ThenInclude(p => p.User)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == request.AppointmentId);

        if (appointment == null) return NotFound("Appointment not found");

        var patientEmail = appointment.Patient?.User?.Email;
        if (string.IsNullOrEmpty(patientEmail))
        {
            return BadRequest("Patient has no email address configured.");
        }

        // Send Email
        var subject = $"Appointment Reminder: {appointment.AppointmentDate} at {appointment.AppointmentTime}";
        var body = $@"
            <h3>Appointment Reminder</h3>
            <p>Dear {appointment.Patient.FullName},</p>
            <p>This is a reminder for your upcoming appointment with Dr. {appointment.Doctor.FullName}.</p>
            <p><strong>Date:</strong> {appointment.AppointmentDate:d}</p>
            <p><strong>Time:</strong> {appointment.AppointmentTime}</p>
            <p>Please arrive 10 minutes early.</p>
            <br/>
            <p>Thank you,</p>
            <p>Admin Team</p>
        ";

        await _emailService.SendEmailAsync(patientEmail, subject, body);

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        await _auditService.LogActionAsync(userId, "REMINDER_SENT", $"Manual reminder sent to {patientEmail} for appointment #{appointment.Id}");

        return Ok(new { message = "Email reminder sent successfully" });
    }
}

public class ReminderRequest
{
    public int AppointmentId { get; set; }
}
