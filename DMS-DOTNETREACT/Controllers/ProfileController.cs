using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Models.BindingModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // All endpoints require authentication
public class ProfileController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public ProfileController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get current user's profile - Available to all authenticated users
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult> GetMyProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var user = await _context.Users
            .Include(u => u.Patient)
            .Include(u => u.Doctor)
            .Include(u => u.Secretary)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        // Return clean DTO based on role to avoid circular references
        object? profileData = null;
        
        if (user.Role == "patient" && user.Patient != null)
        {
            profileData = new
            {
                user.Patient.Id,
                user.Patient.FullName,
                user.Patient.Phone,
                user.Patient.ProfilePhoto,
                user.Patient.Gender,
                user.Patient.BirthDate
            };
        }
        else if (user.Role == "doctor" && user.Doctor != null)
        {
            profileData = new
            {
                user.Doctor.Id,
                user.Doctor.FullName,
                user.Doctor.Specialty,
                user.Doctor.Phone,
                user.Doctor.ProfilePhoto,
                user.Doctor.StartHour,
                user.Doctor.EndHour
            };
        }
        else if (user.Role == "secretary" && user.Secretary != null)
        {
            profileData = new
            {
                user.Secretary.Id,
                user.Secretary.FullName,
                user.Secretary.Phone
            };
        }

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.CreatedAt,
            Profile = profileData
        });
    }

    /// <summary>
    /// Example: Patients can only access their own appointments
    /// </summary>
    [HttpGet("my-appointments")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> GetMyAppointments()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var patient = await _context.Patients
            .Include(p => p.Appointments)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

        return Ok(patient.Appointments);
    }

    /// <summary>
    /// Example: Only doctors can access this endpoint
    /// </summary>
    [HttpGet("doctor-dashboard")]
    [Authorize(Policy = "DoctorOnly")]
    public ActionResult GetDoctorDashboard()
    {
        return Ok(new { message = "Welcome to the doctor dashboard!" });
    }

    /// <summary>
    /// Example: Doctors and secretaries can manage appointments
    /// </summary>
    [HttpGet("manage-appointments")]
    [Authorize(Policy = "DoctorOrSecretary")]
    public async Task<ActionResult> ManageAppointments()
    {
        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .ToListAsync();

        return Ok(appointments);
    }
    /// <summary>
    /// Update patient profile
    /// </summary>
    [HttpPut("patient")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> UpdatePatientProfile([FromBody] UpdatePatientProfileBindingModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId);
        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

        // Update fields
        patient.FullName = model.FullName;
        patient.User.Email = model.Email; // Update Email
        patient.Phone = model.Phone;
        patient.Gender = model.Gender;
        patient.BirthDate = model.BirthDate;
        patient.ProfilePhoto = model.ProfilePhoto;

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            Message = "Profile updated successfully", 
            Patient = new 
            {
                patient.Id,
                patient.FullName,
                patient.Phone,
                patient.Gender,
                patient.BirthDate,
                patient.ProfilePhoto,
                User = new { patient.User.Email }
            }
        });
    }

    /// <summary>
    /// Update doctor profile
    /// </summary>
    [HttpPut("doctor")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> UpdateDoctorProfile([FromBody] UpdateDoctorProfileBindingModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor profile not found");
        }

        // Update fields
        doctor.FullName = model.FullName;
        doctor.User.Email = model.Email; // Update Email
        doctor.Specialty = model.Specialty;
        doctor.Phone = model.Phone;
        Console.WriteLine($"[UpdateDoctorProfile] Incoming Data - StartHour: '{model.StartHour}', EndHour: '{model.EndHour}'");

        if (!string.IsNullOrEmpty(model.StartHour))
        {
            try 
            {
                // Ensure format HH:mm:ss strictly if needed, or allow flexible.
                // Trimming just in case.
                var cleanStart = model.StartHour.Trim();
                doctor.StartHour = TimeOnly.Parse(cleanStart); 
                Console.WriteLine($"[UpdateDoctorProfile] Successfully set StartHour: {doctor.StartHour}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UpdateDoctorProfile] Failed to parse StartHour '{model.StartHour}': {ex.Message}");
            }
        }
        else 
        {
            Console.WriteLine("[UpdateDoctorProfile] StartHour is null or empty. Skipping update.");
        }

        if (!string.IsNullOrEmpty(model.EndHour))
        {
            try 
            {
                var cleanEnd = model.EndHour.Trim();
                doctor.EndHour = TimeOnly.Parse(cleanEnd);
                Console.WriteLine($"[UpdateDoctorProfile] Successfully set EndHour: {doctor.EndHour}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UpdateDoctorProfile] Failed to parse EndHour '{model.EndHour}': {ex.Message}");
            }
        }
        else
        {
             Console.WriteLine("[UpdateDoctorProfile] EndHour is null or empty. Skipping update.");
        }

        doctor.ProfilePhoto = model.ProfilePhoto;

        await _context.SaveChangesAsync();
        Console.WriteLine("[UpdateDoctorProfile] Saved changes to database.");

        return Ok(new 
        { 
            Message = "Profile updated successfully", 
            Doctor = new 
            {
                doctor.Id,
                doctor.FullName,
                doctor.Specialty,
                doctor.Phone,
                doctor.StartHour,
                doctor.EndHour,
                doctor.ProfilePhoto,
                User = new { doctor.User.Email }
            }
        });
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordBindingModel model, [FromServices] Services.PasswordHasher passwordHasher)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Verify current password
        if (!passwordHasher.VerifyPassword(model.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Current password is incorrect");
        }

        // Hash and save new password
        user.PasswordHash = passwordHasher.HashPassword(model.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Password changed successfully" });
    }
}
