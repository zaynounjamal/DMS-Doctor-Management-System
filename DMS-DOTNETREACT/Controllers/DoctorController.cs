using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "DoctorOnly")]
public class DoctorController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly ExportService _exportService;
    private readonly AuditService _auditService;

    public DoctorController(ClinicDbContext context, ExportService exportService, AuditService auditService)
    {
        _context = context;
        _exportService = exportService;
        _auditService = auditService;
    }

    /// <summary>
    /// Get checked-in patients (Waiting Room)
    /// </summary>
    [HttpGet("waiting-room")]
    public async Task<ActionResult> GetWaitingRoom()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null) return NotFound("Doctor not found");

        var today = DateOnly.FromDateTime(DateTime.Today);

        var waitingList = await _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.DoctorId == doctor.Id && 
                        a.AppointmentDate == today && 
                        a.Status == "checked-in")
            .OrderBy(a => a.AppointmentTime)
            .Select(a => new
            {
                a.Id,
                a.AppointmentTime,
                PatientName = a.Patient.FullName,
                PatientId = a.Patient.Id,
                Gender = a.Patient.Gender,
                Phone = a.Patient.Phone,
                a.Status
            })
            .ToListAsync();

        return Ok(waitingList);
    }

    /// <summary>
    /// Get dashboard stats for today
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        var todayAppointments = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate == today)
            .ToListAsync();

        var completedToday = todayAppointments.Count(a => a.IsCompleted);
        var pendingToday = todayAppointments.Count(a => !a.IsCompleted && a.Status != "cancelled");

        var actualProfitToday = todayAppointments
            .Where(a => a.IsCompleted && a.PaymentStatus == "paid")
            .Sum(a => a.FinalPrice ?? 0);

        var expectedProfitToday = todayAppointments
            .Where(a => a.IsCompleted)
            .Sum(a => a.FinalPrice ?? 0);

        var totalPatients = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id)
            .Select(a => a.PatientId)
            .Distinct()
            .CountAsync();

        return Ok(new
        {
            todayAppointments = todayAppointments.Count,
            completedToday,
            pendingToday,
            actualProfitToday,
            expectedProfitToday,
            totalPatients
        });
    }

    /// <summary>
    /// Get statistics for different time periods
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult> GetStatistics([FromQuery] string period = "week")
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        DateTime startDate = period.ToLower() switch
        {
            "yesterday" => DateTime.Today.AddDays(-1),
            "week" => DateTime.Today.AddDays(-7),
            "month" => DateTime.Today.AddMonths(-1),
            "year" => DateTime.Today.AddYears(-1),
            _ => DateTime.Today.AddDays(-7)
        };

        DateTime endDate = period.ToLower() == "yesterday" 
            ? DateTime.Today.AddDays(-1).AddDays(1) 
            : DateTime.Today.AddDays(1);

        var appointments = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id && 
                       a.AppointmentDate >= DateOnly.FromDateTime(startDate) &&
                       a.AppointmentDate < DateOnly.FromDateTime(endDate))
            .ToListAsync();

        var totalAppointments = appointments.Count;
        var completedAppointments = appointments.Count(a => a.IsCompleted);
        var cancelledAppointments = appointments.Count(a => a.Status == "cancelled");

        var actualProfit = appointments
            .Where(a => a.IsCompleted && a.PaymentStatus == "paid")
            .Sum(a => a.FinalPrice ?? 0);

        var expectedProfit = appointments
            .Where(a => a.IsCompleted)
            .Sum(a => a.FinalPrice ?? 0);

        var uniquePatients = appointments
            .Select(a => a.PatientId)
            .Distinct()
            .Count();

        var averageAppointmentValue = completedAppointments > 0
            ? expectedProfit / completedAppointments
            : 0;

        var completionRate = totalAppointments > 0
            ? (double)completedAppointments / totalAppointments * 100
            : 0;

        return Ok(new
        {
            period,
            startDate = startDate.ToString("yyyy-MM-dd"),
            endDate = endDate.ToString("yyyy-MM-dd"),
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            actualProfit,
            expectedProfit,
            uniquePatients,
            averageAppointmentValue,
            completionRate
        });
    }

    /// <summary>
    /// Get list of doctor's patients
    /// </summary>
    [HttpGet("patients")]
    public async Task<ActionResult> GetPatients()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var patients = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id)
            .Include(a => a.Patient)
            .Select(a => a.Patient)
            .Distinct()
            .Select(p => new
            {
                p.Id,
                p.FullName,
                p.Phone,
                p.Gender,
                p.BirthDate,
                p.ProfilePhoto,
                LastVisit = _context.Appointments
                    .Where(a => a.PatientId == p.Id && a.DoctorId == doctor.Id && a.IsCompleted)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => a.AppointmentDate)
                    .FirstOrDefault(),
                TotalVisits = _context.Appointments
                    .Count(a => a.PatientId == p.Id && a.DoctorId == doctor.Id && a.IsCompleted)
            })
            .ToListAsync();

        return Ok(patients);
    }

    /// <summary>
    /// Get detailed information about a specific patient
    /// </summary>
    [HttpGet("patients/{patientId}")]
    public async Task<ActionResult> GetPatientDetails(int patientId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var patient = await _context.Patients.FindAsync(patientId);
        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        // Get appointments with this doctor
        var appointments = await _context.Appointments
            .Where(a => a.PatientId == patientId && a.DoctorId == doctor.Id)
            .Include(a => a.Payment)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                a.Id,
                a.AppointmentDate,
                a.AppointmentTime,
                a.Status,
                a.IsCompleted,
                a.CompletedAt,
                a.FinalPrice,
                a.PaymentStatus,
                a.CompletionNotes,
                Payment = a.Payment != null ? new
                {
                    a.Payment.Amount,
                    a.Payment.PaymentDate,
                    a.Payment.PaymentMethod
                } : null
            })
            .ToListAsync();

        // Financial summary
        var totalPaid = appointments
            .Where(a => a.PaymentStatus == "paid")
            .Sum(a => a.FinalPrice ?? 0);

        var totalUnpaid = appointments
            .Where(a => a.IsCompleted && a.PaymentStatus == "unpaid")
            .Sum(a => a.FinalPrice ?? 0);

        return Ok(new
        {
            patient = new
            {
                patient.Id,
                patient.FullName,
                patient.Phone,
                patient.Gender,
                patient.BirthDate,
                patient.ProfilePhoto
            },
            appointments,
            financialSummary = new
            {
                totalPaid,
                totalUnpaid,
                total = totalPaid + totalUnpaid,
                paidCount = appointments.Count(a => a.PaymentStatus == "paid"),
                unpaidCount = appointments.Count(a => a.IsCompleted && a.PaymentStatus == "unpaid")
            }
        });
    }

    /// <summary>
    /// Get profit analytics
    /// </summary>
    [HttpGet("profit")]
    public async Task<ActionResult> GetProfitAnalytics([FromQuery] string period = "month")
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        DateTime startDate = period.ToLower() switch
        {
            "yesterday" => DateTime.Today.AddDays(-1),
            "week" => DateTime.Today.AddDays(-7),
            "month" => DateTime.Today.AddMonths(-1),
            "year" => DateTime.Today.AddYears(-1),
            _ => DateTime.Today.AddMonths(-1)
        };

        var appointments = await _context.Appointments
            .Where(a => a.DoctorId == doctor.Id && 
                       a.AppointmentDate >= DateOnly.FromDateTime(startDate) &&
                       a.IsCompleted)
            .ToListAsync();

        var actualProfit = appointments
            .Where(a => a.PaymentStatus == "paid")
            .Sum(a => a.FinalPrice ?? 0);

        var expectedProfit = appointments
            .Sum(a => a.FinalPrice ?? 0);

        var unpaidAmount = expectedProfit - actualProfit;

        // Group by date for chart data
        var dailyData = appointments
            .GroupBy(a => a.AppointmentDate)
            .Select(g => new
            {
                date = g.Key.ToString("yyyy-MM-dd"),
                actualProfit = g.Where(a => a.PaymentStatus == "paid").Sum(a => a.FinalPrice ?? 0),
                expectedProfit = g.Sum(a => a.FinalPrice ?? 0)
            })
            .OrderBy(x => x.date)
            .ToList();

        return Ok(new
        {
            period,
            actualProfit,
            expectedProfit,
            unpaidAmount,
            completedAppointments = appointments.Count,
            paidAppointments = appointments.Count(a => a.PaymentStatus == "paid"),
            unpaidAppointments = appointments.Count(a => a.PaymentStatus == "unpaid"),
            dailyData
        });
    }

    /// <summary>
    /// Export appointments to CSV or PDF
    /// </summary>
    [HttpGet("appointments/export")]
    public async Task<ActionResult> ExportAppointments([FromQuery] string format = "csv", [FromQuery] string period = "month", [FromQuery] int? patientId = null)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        DateTime startDate;
        DateTime? endDate = null;

        if (period.ToLower() == "schedule")
        {
            startDate = DateTime.Today; // Future appointments
        }
        else
        {
            startDate = period.ToLower() switch
            {
                "today" => DateTime.Today,
                "yesterday" => DateTime.Today.AddDays(-1),
                "week" => DateTime.Today.AddDays(-7),
                "month" => DateTime.Today.AddMonths(-1),
                "year" => DateTime.Today.AddYears(-1),
                "all" => DateTime.MinValue,
                _ => DateTime.Today.AddMonths(-1)
            };

            // For past periods, we might want to cap at today, but usually "last month" implies a range.
            // For now, keeping existing logic but adding schedule support.
        }

        var query = _context.Appointments
            .Where(a => a.DoctorId == doctor.Id)
            .Include(a => a.Patient)
            .AsQueryable();

        if (period.ToLower() == "schedule")
        {
            query = query.Where(a => a.AppointmentDate >= DateOnly.FromDateTime(startDate));
        }
        else
        {
             query = query.Where(a => a.AppointmentDate >= DateOnly.FromDateTime(startDate));
        }

        if (patientId.HasValue)
        {
            query = query.Where(a => a.PatientId == patientId.Value);
        }

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToListAsync();

        if (format.ToLower() == "pdf")
        {
            var pdfBytes = _exportService.ExportToPdf(appointments, doctor.FullName);
            return File(pdfBytes, "application/pdf", $"Appointments_{period}_{DateTime.Now:yyyyMMdd}.pdf");
        }
        else
        {
            var csvBytes = _exportService.ExportToCsv(appointments);
            return File(csvBytes, "text/csv", $"Appointments_{period}_{DateTime.Now:yyyyMMdd}.csv");
        }
    }

    /// <summary>
    /// Advanced search for appointments
    /// </summary>
    [HttpGet("appointments/search")]
    public async Task<ActionResult> SearchAppointments([FromQuery] string? query, [FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate, [FromQuery] string? status)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var appointmentsQuery = _context.Appointments
            .Where(a => a.DoctorId == doctor.Id)
            .Include(a => a.Patient)
            .AsQueryable();

        // Search by patient name or phone
        if (!string.IsNullOrWhiteSpace(query))
        {
            appointmentsQuery = appointmentsQuery.Where(a => 
                a.Patient.FullName.Contains(query) || 
                a.Patient.Phone.Contains(query));
        }

        // Date range filter
        if (startDate.HasValue)
        {
            appointmentsQuery = appointmentsQuery.Where(a => a.AppointmentDate >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            appointmentsQuery = appointmentsQuery.Where(a => a.AppointmentDate <= endDate.Value);
        }

        // Status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.ToLower() == "completed")
            {
                appointmentsQuery = appointmentsQuery.Where(a => a.IsCompleted);
            }
            else if (status.ToLower() == "pending")
            {
                appointmentsQuery = appointmentsQuery.Where(a => !a.IsCompleted && a.Status != "cancelled");
            }
            else
            {
                appointmentsQuery = appointmentsQuery.Where(a => a.Status == status);
            }
        }

        var appointments = await appointmentsQuery
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .Select(a => new
            {
                a.Id,
                a.AppointmentDate,
                a.AppointmentTime,
                a.Status,
                a.IsCompleted,
                a.FinalPrice,
                a.PaymentStatus,
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.FullName,
                    a.Patient.Phone
                }
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Bulk complete appointments
    /// </summary>
    [HttpPost("appointments/bulk-complete")]
    public async Task<ActionResult> BulkCompleteAppointments([FromBody] BulkCompleteModel model)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var appointments = await _context.Appointments
            .Where(a => model.AppointmentIds.Contains(a.Id) && a.DoctorId == doctor.Id && !a.IsCompleted)
            .ToListAsync();

        if (appointments.Count == 0)
        {
            return BadRequest("No valid appointments found to complete");
        }

        foreach (var appointment in appointments)
        {
            appointment.IsCompleted = true;
            appointment.CompletedAt = DateTime.UtcNow;
            appointment.Status = "done";
            appointment.FinalPrice = model.DefaultPrice ?? appointment.FinalPrice ?? 0;
        }

        await _context.SaveChangesAsync();



        await _auditService.LogActionAsync(userId, "BULK_COMPLETE", $"Doctor {doctor.FullName} completed {appointments.Count} appointments.");

        return Ok(new { 
            message = $"Successfully completed {appointments.Count} appointment(s)",
            completedCount = appointments.Count
        });
    }
}

public class BulkCompleteModel
{
    public List<int> AppointmentIds { get; set; } = new();
    public decimal? DefaultPrice { get; set; }
}
