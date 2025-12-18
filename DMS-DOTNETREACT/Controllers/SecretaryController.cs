using System.Text.Json.Serialization;
using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "SecretaryOnly")]
public class SecretaryController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly AuditService _auditService;

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        return new string(phone.Where(char.IsDigit).ToArray());
    }

    public SecretaryController(ClinicDbContext context, PasswordHasher passwordHasher, AuditService auditService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _auditService = auditService;
    }

    /// <summary>
    /// Dashboard Overview: Appointment counts & Daily Cash
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard([FromQuery] int? doctorId = null)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        
        // Daily Cash: Sum of all "paid" appointments marked today (using CompletedAt or PaymentDate if available)
        // Since we don't have PaymentDate in Appointment (it's in Payment entity), we'll assume marked as paid today.
        // For simplicity and alignment with requirement "Daily Cash Collected Today":
        // We will look for appointments that have Payment marked today. 
        // Or if simple, IsCompleted today && PaymentStatus == "paid".
        // Let's rely on Appointment.CompletedAt if marked done, but Secretary marks as paid.
        // We might need to check if Payment entity exists and its date.
        
        // Better approach: Join with Payment.
        // Filter by doctor if specified
        var paymentsQuery = _context.Payments.Where(p => p.PaymentDate.Date == DateTime.Today);
        var appointmentsQuery = _context.Appointments.AsQueryable();
        
        if (doctorId.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.Appointment.DoctorId == doctorId.Value);
            appointmentsQuery = appointmentsQuery.Where(a => a.DoctorId == doctorId.Value);
        }
        
        var dailyCash = await paymentsQuery.SumAsync(p => p.Amount);
        var todayAppointments = await appointmentsQuery.CountAsync(a => a.AppointmentDate == today);
        var tomorrowAppointments = await appointmentsQuery.CountAsync(a => a.AppointmentDate == today.AddDays(1));
        var waitingCount = await appointmentsQuery.CountAsync(a => a.Status == "checked-in" && a.AppointmentDate == today);

        return Ok(new
        {
            dailyCash,
            todayAppointments,
            tomorrowAppointments,
            waitingCount
        });
    }

    /// <summary>
    /// Get Appointments with Filtering (Tabs)
    /// </summary>

    /// <summary>
    /// Update Appointment Status involves moving to waiting room or cancelling
    /// </summary>



    /// <summary>
    /// Reschedule Appointment
    /// </summary>

    /// <summary>
    /// Create Appointment (Walk-in or Phone)
    /// </summary>

    /// <summary>
    /// Search Patients
    /// </summary>
    [HttpGet("patients")]
    public async Task<ActionResult> SearchPatients([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new List<object>());

        var patients = await _context.Patients
            .Include(p => p.User)
            .Where(p => (p.FullName.Contains(query) || p.Phone.Contains(query)) && p.User.IsActive)
            .Select(p => new
            {
                p.Id,
                p.FullName,
                p.Phone,
                p.Gender,
                p.BirthDate,
                p.User.Username
            })
            .ToListAsync();

        return Ok(patients);
    }

    /// <summary>
    /// Create New Patient
    /// </summary>
    [HttpPost("patients")]
    public async Task<ActionResult> CreatePatient([FromBody] CreatePatientModel model)
    {
        if (await _context.Users.AnyAsync(u => u.Username == model.Username))
        {
            return BadRequest("Username already taken");
        }

        var normalizedPhone = NormalizePhone(model.Phone);
        if (!string.IsNullOrEmpty(normalizedPhone))
        {
            var phoneBlocked = await _context.BlockedPhoneNumbers
                .AnyAsync(x => x.NormalizedPhone == normalizedPhone);
            if (phoneBlocked)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "This phone number is blocked");
            }
        }

        var user = new User
        {
            Username = model.Username,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            Role = "patient",
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = user.Id,
            FullName = model.FullName,
            Phone = model.Phone,
            Gender = model.Gender,
            BirthDate = model.BirthDate
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Patient created", patientId = patient.Id });
    }

    /// <summary>
    /// Edit Patient
    /// </summary>
    [HttpPut("patients/{id}")]
    public async Task<ActionResult> EditPatient(int id, [FromBody] EditPatientModel model)
    {
        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (patient == null) return NotFound();

        patient.FullName = model.FullName;
        patient.Phone = model.Phone;
        // Optionally update Username if passed
        if (!string.IsNullOrEmpty(model.Username) && model.Username != patient.User.Username)
        {
             if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                return BadRequest("Username taken");
             
             patient.User.Username = model.Username;
        }

        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)), "PATIENT_UPDATED", $"Patient {patient.FullName} profile updated.");
        return Ok(new { message = "Patient updated" });
    }

    /// <summary>
    /// Soft Delete Patient
    /// </summary>
    [HttpDelete("patients/{id}")]
    public async Task<ActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (patient == null) return NotFound();

        patient.User.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)), "PATIENT_DELETED", $"Patient {patient.FullName} deactivated.");
        return Ok(new { message = "Patient deactivated" });
    }

    /// <summary>
    /// Get list of all doctors
    /// </summary>
    [HttpGet("doctors")]
    public async Task<ActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors
            .Select(d => new { d.Id, d.FullName, d.Specialty, d.Phone })
            .ToListAsync();

        return Ok(doctors);
    }

    /// <summary>
    /// Get Doctor Availability (Off Days)
    /// </summary>
    [HttpGet("doctor-availability")]
    public async Task<ActionResult> GetDoctorAvailability([FromQuery] int? doctorId = null)
    {
        var query = _context.OffDays
            .Where(d => d.OffDate >= DateOnly.FromDateTime(DateTime.Today));
        
        if (doctorId.HasValue)
        {
            // Get the doctor's UserId
            var doctor = await _context.Doctors.FindAsync(doctorId.Value);
            if (doctor != null)
            {
                query = query.Where(d => d.CreatedByUser == doctor.UserId);
            }
        }
        
        var offDays = await query
            .OrderBy(d => d.OffDate)
            .Select(d => new { Date = d.OffDate.ToString("yyyy-MM-dd"), d.Reason })
            .ToListAsync();

        return Ok(offDays);
    }

    /// <summary>
    /// Get Secretary Profile
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var secretary = await _context.Secretaries
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == int.Parse(userId));

        if (secretary == null) return NotFound("Secretary not found");

        return Ok(new
        {
            id = secretary.Id,
            fullName = secretary.FullName,
            phone = secretary.Phone,
            username = secretary.User.Username
        });
    }

    /// <summary>
    /// Update Secretary Profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateSecretaryProfileModel model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var secretary = await _context.Secretaries
            .FirstOrDefaultAsync(s => s.UserId == int.Parse(userId));

        if (secretary == null) return NotFound("Secretary not found");

        secretary.FullName = model.FullName;
        secretary.Phone = model.Phone;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully" });
    }

    /// <summary>
    /// Get Payment History with Filtering (Includes Deposits)
    /// </summary>
    /// <summary>
    /// Mark Appointment as Paid (and optionally use balance)
    /// </summary>

    /// <summary>
    /// Reset Patient Password
    /// </summary>
    [HttpPut("patients/{id}/password")]
    public async Task<ActionResult> ResetPatientPassword(int id, [FromBody] ResetPasswordModel model)
    {
        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (patient == null) return NotFound("Patient not found");

        patient.User.PasswordHash = _passwordHasher.HashPassword(model.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Patient password reset successfully" });
    }
}


public class CreatePatientModel
{
    public string FullName { get; set; }
    public string Phone { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string? Gender { get; set; }
    public DateOnly? BirthDate { get; set; }
}

public class EditPatientModel
{
    public string FullName { get; set; }
    public string Phone { get; set; }
    public string? Username { get; set; }
}

public class UpdateSecretaryProfileModel
{
    public string FullName { get; set; }
    public string Phone { get; set; }
}



// ... (keep existing imports)

// ... (inside namespace)


public class ChangePasswordModel
{
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

public class ResetPasswordModel
{
    public string NewPassword { get; set; }
}
