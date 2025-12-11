using DMS_DOTNETREACT.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StatsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public StatsController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get public statistics for homepage
    /// </summary>
    [HttpGet("public")]
    public async Task<ActionResult> GetPublicStats()
    {
        var totalPatients = await _context.Patients.CountAsync();
        var totalDoctors = await _context.Doctors.CountAsync();
        var totalAppointments = await _context.Appointments.CountAsync();
        
        return Ok(new
        {
            HappyPatients = totalPatients,
            ExpertDoctors = totalDoctors,
            TotalAppointments = totalAppointments,
            YearsOfExperience = 10 // Hardcoded value
        });
    }
}
