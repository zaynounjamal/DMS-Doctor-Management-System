using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/notifications")]
[ApiController]
[Authorize(Policy = "DoctorOnly")]
public class NotificationController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly EmailService _emailService;

    public NotificationController(ClinicDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("send-reminder")]
    public async Task<ActionResult> SendReminder([FromBody] ReminderModel model)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == model.AppointmentId);

        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        // Verify doctor owns this appointment
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null || appointment.DoctorId != doctor.Id)
        {
            return Forbid();
        }

        // Send email
        // In a real app, we would get the patient's email. For now, we'll simulate or use a test email.
        string toEmail = "patient@example.com"; // Placeholder
        string subject = $"Appointment Reminder: {appointment.AppointmentDate} at {appointment.AppointmentTime}";
        string body = $@"
            <h1>Appointment Reminder</h1>
            <p>Dear {appointment.Patient.FullName},</p>
            <p>This is a reminder for your appointment with Dr. {appointment.Doctor.FullName}.</p>
            <p><strong>Date:</strong> {appointment.AppointmentDate}</p>
            <p><strong>Time:</strong> {appointment.AppointmentTime}</p>
            <p>Please arrive 10 minutes early.</p>
            <br>
            <p>Best regards,</p>
            <p>Clinic Team</p>
        ";

        await _emailService.SendEmailAsync(toEmail, subject, body);

        return Ok(new { message = "Reminder sent successfully" });
    }
}

public class ReminderModel
{
    public int AppointmentId { get; set; }
}
