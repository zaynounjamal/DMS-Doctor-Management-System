using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/admin/holidays")]
[ApiController]
[Authorize(Policy = "AdminOnly")]
public class AdminHolidayController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public AdminHolidayController(ClinicDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Holiday>>> GetHolidays()
    {
        return await _context.Holidays.OrderBy(h => h.Date).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Holiday>> CreateHoliday([FromBody] HolidayModel model)
    {
        if (!DateOnly.TryParse(model.Date, out var date))
        {
            return BadRequest("Invalid date format.");
        }

        // Check if exists
        if (await _context.Holidays.AnyAsync(h => h.Date == date))
        {
            return BadRequest("Holiday already exists on this date.");
        }

        var holiday = new Holiday
        {
            Date = date,
            Name = model.Name,
            IsRecurring = model.IsRecurring
        };

        _context.Holidays.Add(holiday);

        // AUTO-CANCEL APPOINTMENTS
        var conflicts = await _context.Appointments
            .Where(a => a.AppointmentDate == date && a.Status != "cancelled" && a.Status != "completed" && a.Status != "no-show")
            .ToListAsync();

        int cancelledCount = 0;
        foreach (var appt in conflicts)
        {
            appt.Status = "cancelled";
            appt.CancelReason = $"Holiday: {model.Name}";
            cancelledCount++;
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHolidays), new { id = holiday.Id }, new 
        { 
            holiday, 
            message = $"Holiday created. {cancelledCount} conflicting appointments were cancelled." 
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHoliday(int id)
    {
        var holiday = await _context.Holidays.FindAsync(id);
        if (holiday == null)
        {
            return NotFound();
        }

        _context.Holidays.Remove(holiday);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class HolidayModel
{
    public string Name { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public bool IsRecurring { get; set; }
}
