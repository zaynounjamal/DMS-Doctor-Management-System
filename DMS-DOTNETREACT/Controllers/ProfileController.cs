using DMS_DOTNETREACT.Data;
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

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Role,
            user.CreatedAt,
            Profile = user.Role switch
            {
                "patient" => (object?)user.Patient,
                "doctor" => user.Doctor,
                "secretary" => user.Secretary,
                _ => null
            }
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
}
