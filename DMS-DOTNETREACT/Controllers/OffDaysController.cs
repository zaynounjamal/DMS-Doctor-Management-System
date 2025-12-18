using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/doctor/offdays")]
[ApiController]
[Authorize(Policy = "DoctorOnly")]
public class OffDaysController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public OffDaysController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get list of off days for the logged-in doctor
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult> GetOffDays()
    {
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
            return NotFound("Doctor not found");
        }

        var offDays = await _context.OffDays
            .Where(od => od.CreatedByUser == doctor.UserId)
            .OrderBy(od => od.OffDate)
            .Select(od => new
            {
                od.Id,
                od.OffDate,
                od.Reason,
                od.CreatedAt
            })
            .ToListAsync();

        return Ok(offDays);
    }

    /// <summary>
    /// Add a new off day
    /// </summary>
    [HttpPost("add")]
    public async Task<ActionResult> AddOffDay([FromBody] DMS_DOTNETREACT.Models.BindingModels.AddOffDayDto model)
    {
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
            return NotFound("Doctor not found");
        }

        DateOnly offDate;
        if (!DateOnly.TryParse(model.OffDate, out offDate))
        {
             return BadRequest($"Invalid date format: {model.OffDate}. Use yyyy-MM-dd");
        }

        // Check if date is in the past (Allow today)
        if (offDate < DateOnly.FromDateTime(DateTime.Today))
        {
            return BadRequest("Cannot add off days in the past");
        }

        // Check if already exists
        var exists = await _context.OffDays
            .AnyAsync(od => od.CreatedByUser == doctor.UserId && od.OffDate == offDate);

        if (exists)
        {
            return BadRequest("Off day already exists for this date");
        }

        // Auto-cancel conflicting appointments
        var conflicts = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate == offDate && (a.Status ?? "").ToLower() != "cancelled")
            .ToListAsync();

        if (conflicts.Any())
        {
            foreach (var appointment in conflicts)
            {
                appointment.Status = "cancelled";
                appointment.CancelReason = "Doctor Off Day";
            }
            // Save cancellations
            await _context.SaveChangesAsync();
        }

        var offDay = new OffDay
        {
            OffDate = offDate,
            Reason = model.Reason,
            CreatedByUser = doctor.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.OffDays.Add(offDay);
        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = "Off day added successfully" + (conflicts.Any() ? $". {conflicts.Count} appointments were automatically cancelled." : ""), 
            offDay = new {
                offDay.Id,
                offDay.Reason,
                offDay.CreatedByUser,
                OffDate = offDay.OffDate.ToString("yyyy-MM-dd"), // Return string to avoid serialization issues
                offDay.CreatedAt
            }
        });
    }

    /// <summary>
    /// Remove an off day
    /// </summary>
    [HttpDelete("remove/{id}")]
    public async Task<ActionResult> RemoveOffDay(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var offDay = await _context.OffDays.FindAsync(id);
        if (offDay == null)
        {
            return NotFound("Off day not found");
        }

        if (offDay.CreatedByUser != userId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "You can only remove your own off days");
        }

        _context.OffDays.Remove(offDay);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Off day removed successfully" });
    }

    /// <summary>
    /// Check if a specific date is an off day
    /// </summary>
    [HttpGet("check-date")]
    public async Task<ActionResult> CheckOffDay([FromQuery] DateOnly date)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var isOffDay = await _context.OffDays
            .AnyAsync(od => od.CreatedByUser == userId && od.OffDate == date);

        return Ok(new { isOffDay });
    }
}


