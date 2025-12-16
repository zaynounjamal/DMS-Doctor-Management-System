using DMS_DOTNETREACT.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FinancialController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public FinancialController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get patient's financial summary
    /// </summary>
    [HttpGet("summary")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> GetFinancialSummary()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

        // Get all appointments with their payment information
        var appointments = await _context.Appointments
            .Include(a => a.Doctor)
            .Where(a => a.PatientId == patient.Id)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .Select(a => new
            {
                a.Id,
                a.AppointmentDate,
                a.AppointmentTime,
                a.Status,
                a.Price,
                a.FinalPrice,
                a.PaymentStatus,
                Doctor = new
                {
                    a.Doctor.FullName,
                    a.Doctor.Specialty
                },
                a.CreatedAt
            })
            .ToListAsync();

        // Calculate financial summary
        var totalPaid = appointments
            .Where(a => a.PaymentStatus == "paid")
            .Sum(a => a.FinalPrice ?? a.Price ?? 0);

        var totalUnpaid = appointments
            .Where(a => a.PaymentStatus != "paid") // Count anything not paid (null, pending, unpaid) as unpaid
            .Sum(a => a.FinalPrice ?? a.Price ?? 0);

        var remainingBalance = totalUnpaid;

        // Overpaid would be if there are any credits or overpayments (for now, set to 0)
        var overpaid = 0m;

        return Ok(new
        {
            Summary = new
            {
                TotalPaid = totalPaid,
                TotalUnpaid = totalUnpaid,
                RemainingBalance = remainingBalance,
                OverpaidAmount = patient.Balance // Show actual wallet balance
            },
            Appointments = appointments
        });
    }
}
