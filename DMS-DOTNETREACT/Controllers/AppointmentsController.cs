using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Models.BindingModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AppointmentsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public AppointmentsController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all active doctors for appointment booking
    /// </summary>
    [HttpGet("doctors")]
    public async Task<ActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors
            .Include(d => d.User)
            .Where(d => d.User.IsActive)
            .Select(d => new
            {
                d.Id,
                d.FullName,
                Specialization = d.Specialty,
                d.Phone,
                UserId = d.User.Id
            })
            .ToListAsync();

        return Ok(doctors);
    }

    /// <summary>
    /// Get available dates for a specific doctor (next 30 days, excluding off days)
    /// </summary>
    [HttpGet("available-dates")]
    public async Task<ActionResult> GetAvailableDates([FromQuery] int doctorId)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .ThenInclude(u => u.OffDays)
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var today = DateOnly.FromDateTime(DateTime.Today);
        var endDate = today.AddDays(30);

        var availableDates = new List<DateOnly>();

        for (var date = today; date <= endDate; date = date.AddDays(1))
        {
            // Skip weekends (optional - remove if doctors work weekends)
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            // Check if doctor has this day off
            var isOffDay = doctor.User.OffDays.Any(od => od.OffDate == date);
            if (isOffDay)
                continue;

            availableDates.Add(date);
        }

        return Ok(availableDates);
    }

    [HttpGet("time-slots")]
    public async Task<ActionResult> GetTimeSlots()
    {
        try
        {
            string doctorIdStr = Request.Query["doctorId"];
            string dateStr = Request.Query["dateStr"];

            Console.WriteLine($"[GetTimeSlots] Received request. DoctorId: {doctorIdStr}, Date: {dateStr}");

            if (string.IsNullOrEmpty(doctorIdStr) || !int.TryParse(doctorIdStr, out int doctorId))
            {
                 return BadRequest("Valid DoctorId is required");
            }

            if (string.IsNullOrEmpty(dateStr)) return BadRequest("Date is required");

            DateOnly parsedDate;
            // Try strict parsing first
            if (DateOnly.TryParseExact(dateStr, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out parsedDate))
            {
                 // Parsed successfully
            }
            // Fallback to flexible parsing
            else if (DateTime.TryParse(dateStr, out DateTime dt))
            {
                parsedDate = DateOnly.FromDateTime(dt);
            }
            else
            {
                Console.WriteLine($"[GetTimeSlots] Failed to parse date: {dateStr}");
                return BadRequest($"Invalid date format: {dateStr}. Please use yyyy-MM-dd.");
            }

            Console.WriteLine($"[GetTimeSlots] Successfully parsed date: {parsedDate}");

            // Define working hours: 9 AM to 5 PM, 30-minute slots
            var timeSlots = new List<object>();
            var startTime = new TimeOnly(9, 0);
            var endTime = new TimeOnly(17, 0);

            // Check for off day
            var isOffDay = await _context.OffDays
                .AnyAsync(od => od.CreatedByUser == doctorId && od.OffDate == parsedDate);

            if (isOffDay)
            {
                return Ok(new List<object>()); // Return empty list if it's an off day
            }

            // Get existing appointments for this doctor on this date
            var existingAppointments = await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.AppointmentDate == parsedDate && a.Status != "Cancelled")
                .Select(a => a.AppointmentTime)
                .ToListAsync();

            var currentTime = startTime;
            while (currentTime < endTime)
            {
                var isReserved = existingAppointments.Contains(currentTime);

                timeSlots.Add(new
                {
                    Time = currentTime.ToString("HH:mm"),
                    DisplayTime = currentTime.ToString("h:mm tt"),
                    IsAvailable = !isReserved
                });

                currentTime = currentTime.AddMinutes(30);
            }

            return Ok(timeSlots);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GetTimeSlots] Error: {ex.Message}");
            return StatusCode(500, $"Internal Server Error: {ex.Message}");
        }
    }
    /// <summary>
    /// Book an appointment (Patient only)
    /// </summary>
    [HttpPost("book")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> BookAppointment([FromBody] BookAppointmentBindingModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Get current user's patient ID
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

        // Validate doctor exists
        var doctorExists = await _context.Doctors.AnyAsync(d => d.Id == model.DoctorId);
        if (!doctorExists)
        {
            return NotFound("Doctor not found");
        }

        // Check if appointment date is in the past
        if (model.AppointmentDate < DateOnly.FromDateTime(DateTime.Today))
        {
            return BadRequest("Cannot book appointments in the past");
        }

        // Check if time slot is already taken
        var slotTaken = await _context.Appointments
            .AnyAsync(a => a.DoctorId == model.DoctorId 
                        && a.AppointmentDate == model.AppointmentDate 
                        && a.AppointmentTime == model.AppointmentTime
                        && a.Status != "Cancelled");

        if (slotTaken)
        {
            return BadRequest("This time slot is already booked");
        }

        // Create appointment
        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DoctorId = model.DoctorId,
            AppointmentDate = model.AppointmentDate,
            AppointmentTime = model.AppointmentTime,
            Notes = model.Notes,
            Status = "Scheduled",
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Appointment booked successfully",
            AppointmentId = appointment.Id,
            appointment.AppointmentDate,
            appointment.AppointmentTime
        });
    }

    /// <summary>
    /// Cancel an appointment (Patient only, >12 hours notice required)
    /// </summary>
    [HttpPost("cancel/{id}")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> CancelAppointment(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
        if (patient == null) return NotFound("Patient profile not found");

        var appointment = await _context.Appointments
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) return NotFound("Appointment not found");

        // Ensure appointment belongs to this patient
        if (appointment.PatientId != patient.Id)
        {
            return Forbid("You can only cancel your own appointments");
        }

        if (appointment.Status == "Cancelled")
        {
            return BadRequest("Appointment is already cancelled");
        }

        // Check 12-hour notice rule
        var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime);
        if (appointmentDateTime < DateTime.UtcNow.AddHours(12))
        {
            return BadRequest("Appointments can only be cancelled at least 12 hours in advance.");
        }

        appointment.Status = "Cancelled";
        appointment.CancelReason = "Patient cancelled via portal";
        
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Appointment cancelled successfully" });
    }

    /// <summary>
    /// Get current patient's appointments
    /// </summary>
    [HttpGet("my-appointments")]
    [Authorize(Policy = "PatientOnly")]
    public async Task<ActionResult> GetMyAppointments()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (patient == null)
        {
            return NotFound("Patient profile not found");
        }

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
                a.Notes,
                Doctor = new
                {
                    a.Doctor.FullName,
                    Specialization = a.Doctor.Specialty,
                    a.Doctor.Phone
                },
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(appointments);
    }

    // ==================== DOCTOR ENDPOINTS ====================

    /// <summary>
    /// Get today's appointments for the logged-in doctor
    /// </summary>
    [HttpGet("doctor/today")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> GetDoctorTodayAppointments()
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

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.MedicalNotes)
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate == today)
            .OrderBy(a => a.AppointmentTime)
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
                a.Notes,
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.FullName,
                    a.Patient.Phone,
                    a.Patient.Gender,
                    a.Patient.BirthDate
                },
                MedicalNotesCount = a.MedicalNotes.Count
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Get tomorrow's appointments for the logged-in doctor
    /// </summary>
    [HttpGet("doctor/tomorrow")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> GetDoctorTomorrowAppointments()
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

        var tomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(1));

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.MedicalNotes)
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate == tomorrow)
            .OrderBy(a => a.AppointmentTime)
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
                a.Notes,
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.FullName,
                    a.Patient.Phone,
                    a.Patient.Gender,
                    a.Patient.BirthDate
                },
                MedicalNotesCount = a.MedicalNotes.Count
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Get future appointments for the logged-in doctor (after tomorrow)
    /// </summary>
    [HttpGet("doctor/future")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> GetDoctorFutureAppointments()
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

        var dayAfterTomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(2));

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.MedicalNotes)
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate >= dayAfterTomorrow)
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
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
                a.Notes,
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.FullName,
                    a.Patient.Phone,
                    a.Patient.Gender,
                    a.Patient.BirthDate
                },
                MedicalNotesCount = a.MedicalNotes.Count
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Get past appointments for the logged-in doctor
    /// </summary>
    [HttpGet("doctor/past")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> GetDoctorPastAppointments()
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

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.MedicalNotes)
            .Where(a => a.DoctorId == doctor.Id && a.AppointmentDate < today)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
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
                a.Notes,
                Patient = new
                {
                    a.Patient.Id,
                    a.Patient.FullName,
                    a.Patient.Phone,
                    a.Patient.Gender,
                    a.Patient.BirthDate
                },
                MedicalNotesCount = a.MedicalNotes.Count
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Mark appointment as done with final price and completion notes
    /// </summary>
    [HttpPut("{id}/complete")]
    [Authorize(Policy = "DoctorOnly")]
    public async Task<ActionResult> CompleteAppointment(int id, [FromBody] CompleteAppointmentBindingModel model)
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

        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        if (appointment.DoctorId != doctor.Id)
        {
            return Forbid("You can only complete your own appointments");
        }

        if (appointment.IsCompleted)
        {
            return BadRequest("Appointment is already completed. Price is locked.");
        }

        appointment.IsCompleted = true;
        appointment.CompletedAt = DateTime.UtcNow;
        appointment.FinalPrice = model.FinalPrice;
        appointment.CompletionNotes = model.CompletionNotes;
        appointment.Status = "done";

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Appointment marked as done", Appointment = appointment });
    }
}
