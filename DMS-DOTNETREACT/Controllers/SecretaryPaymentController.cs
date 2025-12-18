using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/secretary")] // Keep same base route to avoid frontend changes
[ApiController]
[Authorize(Policy = "SecretaryOnly")]
public class SecretaryPaymentController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly AuditService _auditService;

    public SecretaryPaymentController(ClinicDbContext context, AuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    /// <summary>
    /// Get Payment History with Filtering (Includes Deposits)
    /// </summary>
    [HttpGet("payments")]
    public async Task<ActionResult> GetPaymentHistory(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? doctorId = null)
    {
        // Default to last 30 days if no dates provided
        var start = startDate ?? DateTime.Today.AddDays(-30);
        var end = endDate.HasValue ? endDate.Value.AddDays(1) : DateTime.Today.AddDays(1);

        // 1. Fetch Payments (Appointments)
        var paymentsQuery = _context.Payments
            .Include(p => p.Appointment)
                .ThenInclude(a => a.Patient)
            .Include(p => p.Appointment)
                .ThenInclude(a => a.Doctor)
            .AsQueryable();

        paymentsQuery = paymentsQuery.Where(p => p.PaymentDate >= start && p.PaymentDate < end);

        // Filter by doctor if specified
        if (doctorId.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.Appointment.DoctorId == doctorId.Value);
        }

        var apptPayments = await paymentsQuery
            .Select(p => new
            {
                p.Id,
                PaymentDate = p.PaymentDate,
                p.Amount,
                p.PaymentMethod,
                Type = "Payment",
                AppointmentId = (int?)p.Appointment.Id,
                PatientName = p.Appointment.Patient.FullName,
                DoctorName = p.Appointment.Doctor.FullName
            })
            .ToListAsync();

        // 2. Fetch Deposits (Transactions) - Only if no doctor filter (Deposits aren't doctor-specific)
        var deposits = new List<dynamic>();
        if (!doctorId.HasValue)
        {
            var transactionsQuery = _context.Transactions
                .Include(t => t.Patient)
                .Where(t => t.Type == "Deposit" && t.CreatedAt >= start && t.CreatedAt < end);

            var txnList = await transactionsQuery
                .Select(t => new
                {
                    t.Id,
                    PaymentDate = t.CreatedAt,
                    t.Amount,
                    PaymentMethod = "Deposit", // Label as Deposit
                    Type = "Deposit",
                    AppointmentId = (int?)null,
                    PatientName = t.Patient.FullName,
                    DoctorName = "-" // No doctor for deposits
                })
                .ToListAsync();
            
            deposits.AddRange(txnList);
        }

        // 3. Merge and Sort
        var allHistory = apptPayments.Cast<dynamic>().Concat(deposits)
            .OrderByDescending(x => x.PaymentDate)
            .ToList();

        // 4. Map to Response Format
        var payments = allHistory.Select(x => new
        {
            id = x.Id,
            paymentDate = x.PaymentDate,
            amount = x.Amount,
            paymentMethod = x.PaymentMethod,
            type = x.Type,
            appointment = new
            {
                id = x.AppointmentId ?? 0,
                date = x.PaymentDate, // Use payment date as fallback
                time = DateOnly.FromDateTime(x.PaymentDate), // Placeholder
                patientName = x.PatientName,
                doctorName = x.DoctorName
            }
        }).ToList();

        // Calculate summary statistics
        var totalAmount = payments.Sum(p => (decimal)p.amount);
        var paymentCount = payments.Count;
        var averagePayment = paymentCount > 0 ? totalAmount / paymentCount : 0;

        // Group by payment method
        var byMethod = payments
            .GroupBy(p => (string)p.paymentMethod ?? "Unknown")
            .Select(g => new { method = g.Key, total = g.Sum(p => (decimal)p.amount), count = g.Count() })
            .ToList();

        // Group by doctor
        var byDoctor = payments
            .GroupBy(p => (string)p.appointment.doctorName)
            .Select(g => new { doctor = g.Key, total = g.Sum(p => (decimal)p.amount), count = g.Count() })
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
}

public class PayAppointmentModel
{
    [JsonPropertyName("paymentMethod")]
    public string PaymentMethod { get; set; }
}

public class AddBalanceModel
{
    public decimal Amount { get; set; }
}
