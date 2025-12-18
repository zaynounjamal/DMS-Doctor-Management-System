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
                // EXCLUDING MedicalNotes
                Payment = a.Payment // Include payment details if needed
            })
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Update Appointment Status involves moving to waiting room or cancelling
    /// </summary>
    [HttpPut("appointments/{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusModel model)
    {
        var appt = await _context.Appointments.FindAsync(id);
        if (appt == null) return NotFound();

        var oldStatus = (appt.Status ?? string.Empty).ToLowerInvariant();
        var newStatus = (model.Status ?? string.Empty).ToLowerInvariant();
        appt.Status = newStatus; // "checked-in", "cancelled", "scheduled", "no-show"
        
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

        var proposedDateTime = model.NewDate.ToDateTime(model.NewTime);
        if (proposedDateTime < DateTime.Now)
        {
            return BadRequest("Cannot reschedule an appointment to a past date/time");
        }

        appt.AppointmentDate = model.NewDate;
        appt.AppointmentTime = model.NewTime;
        appt.StartTime = model.NewTime;
        appt.EndTime = model.NewTime.AddMinutes(30); // Default 30 min? Or keep duration?
        appt.Status = "scheduled"; // Reset status if it was cancelled

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
            Price = model.Price, // Use price from frontend (e.g. standard visit price)
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appt);
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)), "APPOINTMENT_CREATED", $"Appointment created for patient {model.PatientId} with doctor {model.DoctorId} on {model.Date}");

        return Ok(new { message = "Appointment created", id = appt.Id });
    }

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
    /// Get Payment History with Filtering
    /// </summary>
    [HttpGet("payments")]
    public async Task<ActionResult> GetPaymentHistory(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? doctorId = null)
    {
        var query = _context.Payments
            .Include(p => p.Appointment)
                .ThenInclude(a => a.Patient)
            .Include(p => p.Appointment)
                .ThenInclude(a => a.Doctor)
            .AsQueryable();

        // Default to last 30 days if no dates provided
        var start = startDate ?? DateTime.Today.AddDays(-30);
        var end = endDate ?? DateTime.Today.AddDays(1);

        query = query.Where(p => p.PaymentDate >= start && p.PaymentDate < end);

        // Filter by doctor if specified
        if (doctorId.HasValue)
        {
            query = query.Where(p => p.Appointment.DoctorId == doctorId.Value);
        }

        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                id = p.Id,
                paymentDate = p.PaymentDate,
                amount = p.Amount,
                paymentMethod = p.PaymentMethod,
                appointment = new
                {
                    id = p.Appointment.Id,
                    date = p.Appointment.AppointmentDate,
                    time = p.Appointment.AppointmentTime,
                    patientName = p.Appointment.Patient.FullName,
                    doctorName = p.Appointment.Doctor.FullName
                }
            })
            .ToListAsync();

        // Calculate summary statistics
        var totalAmount = payments.Sum(p => p.amount);
        var paymentCount = payments.Count;
        var averagePayment = paymentCount > 0 ? totalAmount / paymentCount : 0;

        // Group by payment method
        var byMethod = payments
            .GroupBy(p => p.paymentMethod ?? "Unknown")
            .Select(g => new { method = g.Key, total = g.Sum(p => p.amount), count = g.Count() })
            .ToList();

        // Group by doctor
        var byDoctor = payments
            .GroupBy(p => p.appointment.doctorName)
            .Select(g => new { doctor = g.Key, total = g.Sum(p => p.amount), count = g.Count() })
            .OrderByDescending(x => x.total)
            .ToList();

        return Ok(new
        {
            payments,
            summary = new
            {
                totalAmount,
                paymentCount,
                averagePayment,
                dateRange = new { start, end },
                byMethod,
                byDoctor
            }
        });
    }
    /// <summary>
    /// Mark Appointment as Paid (and optionally use balance)
    /// </summary>
    [HttpPut("appointments/{id}/pay")]
    public async Task<ActionResult> MarkAsPaid(int id, [FromBody] PayAppointmentModel model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var secretary = await _context.Secretaries.FirstOrDefaultAsync(s => s.UserId == int.Parse(userId));
        if (secretary == null) return Unauthorized("Secretary not found");

        var appt = await _context.Appointments
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == id);
            
        if (appt == null) return NotFound("Appointment not found");

        if (appt.PaymentStatus == "paid")
            return BadRequest("Appointment is already paid");

        // Safety check & Retry Logic
        var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == id);
        if (existingPayment != null)
        {
             // Case 1: User wants to Pay with Balance, but existing payment is NOT Balance (e.g. failed earlier or null).
             // We should allow this retry to go through and actually deduct balance.
             if (model.PaymentMethod == "Balance" && existingPayment.PaymentMethod != "Balance")
             {
                 _context.Payments.Remove(existingPayment);
                 // Fall through to normal logic to deduct balance and create new payment
             }
             // Case 2: Duplicate request (Same method or just checking)
             else 
             {
                 if (appt.PaymentStatus != "paid")
                 {
                     appt.PaymentStatus = "paid";
                     await _context.SaveChangesAsync();
                 }
                 return Ok(new { message = "Payment record found. Status updated to Paid.", balance = appt.Patient.Balance });
             }
        }

        decimal amountToPay = appt.FinalPrice ?? appt.Price ?? 0;
        
        // Handle Balance Payment
        if (model.PaymentMethod == "Balance")
        {
            if (appt.Patient.Balance < amountToPay)
            {
                return BadRequest($"Insufficient balance. Current balance: ${appt.Patient.Balance}");
            }

            // Deduct from balance
            appt.Patient.Balance -= amountToPay;
            
            // Record Transaction
            var transaction = new Transaction
            {
                PatientId = appt.PatientId,
                Amount = -amountToPay,
                Type = "Payment",
                Description = $"Payment for Appointment #{appt.Id}",
                CreatedByUserId = secretary.UserId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Transactions.Add(transaction);
        }

        // Record Payment
        var payment = new Payment
        {
            AppointmentId = appt.Id,
            SecretaryId = secretary.Id,
            Amount = amountToPay,
            PaymentMethod = model.PaymentMethod,
            PaymentDate = DateTime.UtcNow,
            PaidAt = DateTime.UtcNow
        };

        appt.PaymentStatus = "paid";
        
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        await _auditService.LogActionAsync(secretary.UserId, "PAYMENT_PROCESSED", $"Payment of ${amountToPay} processed for Appointment #{appt.Id} via {model.PaymentMethod}");

        return Ok(new { message = "Payment successful", balance = appt.Patient.Balance });
    }

    /// <summary>
    /// Add Funds to Patient Balance
    /// </summary>
    [HttpPost("patients/{id}/balance")]
    public async Task<ActionResult> AddBalance(int id, [FromBody] AddBalanceModel model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound("Patient not found");

        if (model.Amount <= 0) return BadRequest("Amount must be positive");

        patient.Balance += model.Amount;

        var transaction = new Transaction
        {
            PatientId = patient.Id,
            Amount = model.Amount,
            Type = "Deposit",
            Description = "Funds added by secretary",
            CreatedByUserId = int.Parse(userId),
            CreatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        await _auditService.LogActionAsync(int.Parse(userId), "BALANCE_ADDED", $"Added ${model.Amount} to patient {patient.Id} balance");

        return Ok(new { message = "Funds added successfully", balance = patient.Balance });
    }

    /// <summary>
    /// Get Patient Transactions
    /// </summary>
    [HttpGet("patients/{id}/transactions")]
    public async Task<ActionResult> GetTransactions(int id)
    {
        var transactions = await _context.Transactions
            .Where(t => t.PatientId == id)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Amount,
                t.Type,
                t.Description,
                t.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }
    /// <summary>
    /// Update Secretary Password
    /// </summary>
    [HttpPut("profile/change-password")]
    public async Task<ActionResult> UpdateSecretaryPassword([FromBody] ChangePasswordModel model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var secretary = await _context.Secretaries.Include(s => s.User).FirstOrDefaultAsync(s => s.UserId == int.Parse(userId));
        if (secretary == null) return NotFound("Secretary not found");

        // Verify old password
        if (!_passwordHasher.VerifyPassword(model.OldPassword, secretary.User.PasswordHash))
        {
            return BadRequest("Incorrect old password");
        }

        // Update password
        secretary.User.PasswordHash = _passwordHasher.HashPassword(model.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully" });
    }

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

public class PayAppointmentModel
{
    [JsonPropertyName("paymentMethod")]
    public string PaymentMethod { get; set; }
}


public class AddBalanceModel
{
    public decimal Amount { get; set; }
}

public class ChangePasswordModel
{
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

public class ResetPasswordModel
{
    public string NewPassword { get; set; }
}
