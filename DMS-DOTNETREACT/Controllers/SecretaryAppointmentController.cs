using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/secretary")]
[ApiController]
[Authorize(Policy = "SecretaryOnly")]
public class SecretaryAppointmentController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly AuditService _auditService;

    public SecretaryAppointmentController(ClinicDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        return new string(phone.Where(char.IsDigit).ToArray());
    }

    /// <summary>
    /// Get Appointments with Filtering (Tabs)
    /// </summary>
    [HttpGet("appointments")]
    public async Task<ActionResult> GetAppointments([FromQuery] string tab = "today", [FromQuery] string? status = null, [FromQuery] int? doctorId = null)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Payment)
            .AsNoTracking(); // Read-only for list
        
        // Filter by doctor if specified
        if (doctorId.HasValue)
        {
            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        switch (tab.ToLower())
        {
            case "today":
                query = query.Where(a => a.AppointmentDate == today);
                break;
            case "tomorrow":
                query = query.Where(a => a.AppointmentDate == today.AddDays(1));
                break;
            case "future":
                query = query.Where(a => a.AppointmentDate > today.AddDays(1));
                break;
            case "past":
                query = query.Where(a => a.AppointmentDate < today);
                break;
            default: // "all" or specific date range could be added
                if (tab != "all") query = query.Where(a => a.AppointmentDate == today);
                break;
        }

        if (!string.IsNullOrEmpty(status))
        {
            if (status == "waiting")
                query = query.Where(a => a.Status == "checked-in");
            else
                query = query.Where(a => a.Status == status);
        }

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new
            {
                a.Id,
                a.AppointmentDate,
                a.AppointmentTime,
                a.Status,
                a.PaymentStatus,
                a.FinalPrice, // Read-only price
                a.Price, // Initial price
                Patient = new { a.Patient.FullName, a.Patient.Phone, a.Patient.Id },
                Payment = a.Payment // Include payment details if needed
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Update Appointment Status
    /// </summary>
    [HttpPut("appointments/{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusModel model)
    {
        var appt = await _context.Appointments.FindAsync(id);
        if (appt == null) return NotFound();

        var oldStatus = (appt.Status ?? string.Empty).ToLowerInvariant();
        var newStatus = (model.Status ?? string.Empty).ToLowerInvariant();
        appt.Status = newStatus;
        
        if (newStatus == "cancelled")
        {
            appt.CancelReason = model.Reason;
        }

        if (oldStatus != "no-show" && newStatus == "no-show")
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == appt.PatientId);

            if (patient != null)
            {
                patient.User.NoShowCount += 1;

                if (patient.User.NoShowCount >= 3)
                {
                    patient.User.IsLoginBlocked = true;
                    patient.User.IsBookingBlocked = true;
                    patient.User.BlockReason = "Auto-blocked due to 3+ no-shows";
                    patient.User.BlockedAt = DateTime.UtcNow;
                }
            }
        }

        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)), "APPOINTMENT_STATUS_UPDATE", $"Appointment #{id} status updated to {model.Status}");
        return Ok(new { message = "Status updated", status = appt.Status });
    }

    /// <summary>
    /// Reschedule Appointment
    /// </summary>
    [HttpPut("appointments/{id}/reschedule")]
    public async Task<ActionResult> Reschedule(int id, [FromBody] RescheduleModel model)
    {
        var appt = await _context.Appointments.FindAsync(id);
        if (appt == null) return NotFound();

        // Validate Date not in past?
        var proposedDateTime = model.NewDate.ToDateTime(model.NewTime);
        if (proposedDateTime < DateTime.Now)
        {
            return BadRequest("Cannot reschedule an appointment to a past date/time");
        }

        appt.AppointmentDate = model.NewDate;
        appt.AppointmentTime = model.NewTime;
        appt.StartTime = model.NewTime;
        appt.EndTime = model.NewTime.AddMinutes(30);
        appt.Status = "scheduled"; 

        await _context.SaveChangesAsync();
        return Ok(new { message = "Rescheduled successfully" });
    }

    /// <summary>
    /// Create Appointment (Walk-in or Phone)
    /// </summary>
    [HttpPost("appointments")]
    public async Task<ActionResult> CreateAppointment([FromBody] CreateAppointmentModel model)
    {
        // 1. Check Doctor exists
        var doctor = await _context.Doctors.FindAsync(model.DoctorId);
        if (doctor == null) return BadRequest("Doctor not found");

        var patient = await _context.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == model.PatientId);
        if (patient == null) return BadRequest("Patient not found");

        if (patient.User.IsBookingBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                string.IsNullOrWhiteSpace(patient.User.BlockReason)
                    ? "Booking is blocked for this account"
                    : patient.User.BlockReason);
        }

        var normalizedPhone = NormalizePhone(patient.Phone);
        if (!string.IsNullOrEmpty(normalizedPhone))
        {
            var phoneBlocked = await _context.BlockedPhoneNumbers
                .AnyAsync(x => x.NormalizedPhone == normalizedPhone);
            if (phoneBlocked)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "This phone number is blocked");
            }
        }

        var proposedDateTime = model.Date.ToDateTime(model.Time);
        if (proposedDateTime < DateTime.Now)
        {
            // Allow secretary to book back-dated? probably not.
            return BadRequest("Cannot create an appointment in the past");
        }

        // Check if slot is taken
        bool isTaken = await _context.Appointments.AnyAsync(a => 
            a.DoctorId == model.DoctorId && 
            a.AppointmentDate == model.Date && 
            a.AppointmentTime == model.Time &&
            a.Status != "cancelled");

        if (isTaken) return BadRequest("Slot already taken");
        
        // Check Off Days
        bool isOffDay = await _context.OffDays.AnyAsync(d => d.CreatedByUser == doctor.UserId && d.OffDate == model.Date);
        if (isOffDay) return BadRequest("Doctor is off on this day");

        var appt = new Appointment
        {
            DoctorId = model.DoctorId,
            PatientId = model.PatientId,
            AppointmentDate = model.Date,
            AppointmentTime = model.Time,
            StartTime = model.Time,
            EndTime = model.Time.AddMinutes(30),
            Status = "scheduled",
            AppointmentType = "walk-in", // or phone
            Price = model.Price, 
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appt);
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)), "APPOINTMENT_CREATED", $"Appointment created for patient {model.PatientId} with doctor {model.DoctorId} on {model.Date}");

        return Ok(new { message = "Appointment created", id = appt.Id });
    }
}

public class UpdateStatusModel
{
    public string Status { get; set; }
    public string? Reason { get; set; }
}

public class RescheduleModel
{
    public DateOnly NewDate { get; set; }
    public TimeOnly NewTime { get; set; }
}

public class CreateAppointmentModel
{
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public decimal? Price { get; set; }
}
