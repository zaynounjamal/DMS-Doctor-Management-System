using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly AuditService _auditService;

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        return new string(phone.Where(char.IsDigit).ToArray());
    }

    public AdminController(ClinicDbContext context, PasswordHasher passwordHasher, AuditService auditService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _auditService = auditService;
    }

    public class BlockUserRequest
    {
        public bool BlockLogin { get; set; } = true;
        public bool BlockBooking { get; set; } = true;
        public string? Reason { get; set; }
    }

    [HttpPost("users/{id}/block")]
    public async Task<ActionResult> BlockUser(int id, [FromBody] BlockUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        user.IsLoginBlocked = request.BlockLogin;
        user.IsBookingBlocked = request.BlockBooking;
        user.BlockReason = string.IsNullOrWhiteSpace(request.Reason) ? "Blocked by admin" : request.Reason;
        user.BlockedAt = DateTime.UtcNow;
        user.BlockedByUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminUserId)
            ? adminUserId
            : null;

        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(user.Id, "USER_BLOCKED", $"User {user.Username} blocked. Login={user.IsLoginBlocked}, Booking={user.IsBookingBlocked}");
        return Ok(new { message = "User blocked" });
    }

    [HttpPost("users/{id}/unblock")]
    public async Task<ActionResult> UnblockUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        user.IsLoginBlocked = false;
        user.IsBookingBlocked = false;
        user.BlockReason = null;
        user.BlockedAt = null;
        user.BlockedByUserId = null;
        user.NoShowCount = 0;

        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(user.Id, "USER_UNBLOCKED", $"User {user.Username} unblocked and no-show count reset.");
        return Ok(new { message = "User unblocked" });
    }

    public class BlockPhoneRequest
    {
        public string Phone { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    [HttpGet("blocked-phones")]
    public async Task<ActionResult> GetBlockedPhones()
    {
        var items = await _context.BlockedPhoneNumbers
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("blocked-phones")]
    public async Task<ActionResult> AddBlockedPhone([FromBody] BlockPhoneRequest request)
    {
        var normalized = NormalizePhone(request.Phone);
        if (string.IsNullOrEmpty(normalized)) return BadRequest("Phone is required");

        var exists = await _context.BlockedPhoneNumbers.AnyAsync(x => x.NormalizedPhone == normalized);
        if (exists) return BadRequest("Phone number is already blocked");

        var createdByUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid)
            ? uid
            : (int?)null;
        var item = new BlockedPhoneNumber
        {
            NormalizedPhone = normalized,
            Reason = request.Reason,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BlockedPhoneNumbers.Add(item);
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(createdByUserId, "PHONE_BLOCKED", $"Phone {normalized} blocked");
        return Ok(item);
    }

    [HttpDelete("blocked-phones/{id}")]
    public async Task<ActionResult> RemoveBlockedPhone(int id)
    {
        var item = await _context.BlockedPhoneNumbers.FindAsync(id);
        if (item == null) return NotFound("Blocked phone not found");

        _context.BlockedPhoneNumbers.Remove(item);
        await _context.SaveChangesAsync();

        var removedBy = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var uid)
            ? uid
            : (int?)null;
        await _auditService.LogActionAsync(removedBy, "PHONE_UNBLOCKED", $"Phone {item.NormalizedPhone} unblocked");
        return Ok(new { message = "Phone unblocked" });
    }

    /// <summary>
    /// Admin Dashboard Stats
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboardStats()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var startOfPrevMonth = startOfMonth.AddMonths(-1);

        // Revenue (Cash + Balance/Card payments)
        // We look at Payments table
        var totalRevenue = await _context.Payments.SumAsync(p => p.Amount);
        var revenueToday = await _context.Payments
            .Where(p => p.PaymentDate.Date == DateTime.Today)
            .SumAsync(p => p.Amount);
        
        var revenueMonth = await _context.Payments
            .Where(p => p.PaymentDate.Date >= startOfMonth.ToDateTime(TimeOnly.MinValue))
            .SumAsync(p => p.Amount);

        var revenuePrevMonth = await _context.Payments
            .Where(p => p.PaymentDate.Date >= startOfPrevMonth.ToDateTime(TimeOnly.MinValue)
                        && p.PaymentDate.Date < startOfMonth.ToDateTime(TimeOnly.MinValue))
            .SumAsync(p => p.Amount);

        // Appointments
        var totalAppointments = await _context.Appointments.CountAsync();
        var appointmentsToday = await _context.Appointments.CountAsync(a => a.AppointmentDate == today);
        var appointmentsYesterday = await _context.Appointments.CountAsync(a => a.AppointmentDate == today.AddDays(-1));
        
        // Patients
        var totalPatients = await _context.Patients.CountAsync();
        var newPatientsMonth = await _context.Patients
            .Include(p => p.User)
            .CountAsync(p => p.User.CreatedAt >= startOfMonth.ToDateTime(TimeOnly.MinValue));

        var newPatientsPrevMonth = await _context.Patients
            .Include(p => p.User)
            .CountAsync(p => p.User.CreatedAt >= startOfPrevMonth.ToDateTime(TimeOnly.MinValue)
                            && p.User.CreatedAt < startOfMonth.ToDateTime(TimeOnly.MinValue));

        static double? PercentChange(double current, double previous)
        {
            if (previous == 0)
            {
                return current == 0 ? 0 : 100;
            }

            return ((current - previous) / previous) * 100;
        }

        var trendRevenueMonth = PercentChange((double)revenueMonth, (double)revenuePrevMonth);
        var trendAppointmentsToday = PercentChange(appointmentsToday, appointmentsYesterday);
        var trendNewPatientsMonth = PercentChange(newPatientsMonth, newPatientsPrevMonth);

        // Quick insights (best-effort)
        string? peakHours = null;
        var todaysAppts = await _context.Appointments
            .Where(a => a.AppointmentDate == today)
            .Select(a => a.AppointmentTime)
            .ToListAsync();

        if (todaysAppts.Count > 0)
        {
            var peakHour = todaysAppts
                .GroupBy(t => t.Hour)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();

            var endHour = (peakHour + 3) % 24;
            peakHours = $"{peakHour:00}:00 - {endHour:00}:00";
        }

        // Not currently tracked in DB; returned as null unless you add a real satisfaction metric.
        string? patientSatisfaction = null;

        return Ok(new
        {
            totalRevenue,
            revenueToday,
            revenueMonth,
            totalAppointments,
            appointmentsToday,
            totalPatients,
            newPatientsMonth,
            trends = new
            {
                totalRevenue = trendRevenueMonth,
                totalAppointments = trendAppointmentsToday,
                totalPatients = trendNewPatientsMonth,
                revenueMonth = trendRevenueMonth
            },
            peakHours,
            patientSatisfaction
        });
    }

    // --- TREATMENTS MANAGEMENT ---

    [HttpGet("treatments")]
    public async Task<ActionResult> GetTreatments()
    {
        var treatments = await _context.Treatments.ToListAsync();
        return Ok(treatments);
    }

    [HttpPost("treatments")]
    public async Task<ActionResult> CreateTreatment([FromBody] TreatmentModel model)
    {
        var treatment = new Treatment
        {
            Name = model.Name,
            Description = model.Description,
            Price = model.Price,
            Icon = model.Icon,
            IsActive = true
        };

        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();
        return Ok(treatment);
    }

    [HttpPut("treatments/{id}")]
    public async Task<ActionResult> UpdateTreatment(int id, [FromBody] TreatmentModel model)
    {
        var treatment = await _context.Treatments.FindAsync(id);
        if (treatment == null) return NotFound("Treatment not found");

        treatment.Name = model.Name;
        treatment.Description = model.Description;
        treatment.Price = model.Price;
        treatment.Icon = model.Icon;
        // treatment.IsActive = model.IsActive; // Assuming model has it, or keep existing

        await _context.SaveChangesAsync();
        return Ok(treatment);
    }

    [HttpDelete("treatments/{id}")]
    public async Task<ActionResult> DeleteTreatment(int id)
    {
        var treatment = await _context.Treatments.FindAsync(id);
        if (treatment == null) return NotFound("Treatment not found");

        // Soft delete or hard delete? Let's check dependencies.
        // If used in PatientTreatments, we can't hard delete easily.
        // For now, let's try hard delete and catch error, or just toggle active.
        // Standard requirement usually implies soft delete if data exists.
        
        // Check usage
        bool used = await _context.PatientTreatments.AnyAsync(pt => pt.TreatmentId == id);
        if (used)
        {
             // return BadRequest("Cannot delete treatment as it is assigned to patients. Deactivate it instead.");
             treatment.IsActive = false;
             await _context.SaveChangesAsync();
             return Ok(new { message = "Treatment deactivated (used in records)" });
        }

        _context.Treatments.Remove(treatment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Treatment deleted successfully" });
    }

    // --- SYSTEM SETTINGS ---

    [HttpGet("settings")]
    public async Task<ActionResult> GetSettings()
    {
        var settings = await _context.SystemSettings.ToListAsync();
        return Ok(settings);
    }

    [HttpPut("settings")]
    public async Task<ActionResult> UpdateSettings([FromBody] List<SystemSettingModel> settings)
    {
        foreach (var setting in settings)
        {
            var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == setting.Key);
            if (existing != null)
            {
                existing.Value = setting.Value;
                existing.Description = setting.Description ?? existing.Description;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Settings updated successfully" });
    }

    // --- USER MANAGEMENT ---

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Doctor)
            .Include(u => u.Secretary)
            .Include(u => u.Patient)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.Role,
                u.IsActive,
                u.IsLoginBlocked,
                u.IsBookingBlocked,
                u.BlockReason,
                u.BlockedAt,
                u.NoShowCount,
                u.CreatedAt,
                Phone = u.Patient != null ? u.Patient.Phone : (u.Doctor != null ? u.Doctor.Phone : (u.Secretary != null ? u.Secretary.Phone : null)),
                FullName = u.Doctor != null ? u.Doctor.FullName :
                           u.Secretary != null ? u.Secretary.FullName :
                           u.Patient != null ? u.Patient.FullName : "System User"
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserModel model)
    {
        if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            return BadRequest("Username and Password are required");

        if (await _context.Users.AnyAsync(u => u.Username == model.Username))
            return BadRequest("Username is already taken");

        var user = new User
        {
            Username = model.Username,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            Email = model.Email,
            Role = model.Role.ToLower(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        if (model.Role.ToLower() == "doctor")
        {
            var doctor = new Doctor
            {
                User = user,
                FullName = model.FullName,
                Phone = model.Phone,
                Specialty = model.Specialty
            };
            _context.Doctors.Add(doctor);
        }
        else if (model.Role.ToLower() == "secretary")
        {
            var secretary = new Secretary
            {
                User = user,
                FullName = model.FullName,
                Phone = model.Phone
            };
            _context.Secretaries.Add(secretary);
        }
        else if (model.Role.ToLower() == "patient")
        {
             // Basic patient creation if admin does it
             var patient = new Patient
             {
                 User = user,
                 FullName = model.FullName,
                 Phone = model.Phone,
                 Gender = "Unknown", // Admin simplified creation
                 BirthDate = DateOnly.FromDateTime(DateTime.Today) // Default
             };
             _context.Patients.Add(patient);
        }

        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(user.Id, "USER_CREATED", $"User {user.Username} ({model.Role}) created by admin.");
        return Ok(new { message = "User created successfully", userId = user.Id });
    }

    [HttpPost("users/{id}/toggle-status")]
    public async Task<ActionResult> ToggleUserStatus(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(user.Id, "USER_STATUS_CHANGE", $"User {user.Username} status changed to {(user.IsActive ? "active" : "inactive")}.");

        return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")}", isActive = user.IsActive });
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<ActionResult> ResetPassword(int id, [FromBody] object payload)
    {
        // Simple payload: { "newPassword": "..." }
        var json = System.Text.Json.JsonDocument.Parse(payload.ToString()).RootElement;
        if (!json.TryGetProperty("newPassword", out var pwdProp))
            return BadRequest("newPassword is required");

        string newPassword = pwdProp.GetString();
        if (string.IsNullOrEmpty(newPassword)) return BadRequest("Password cannot be empty");

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        user.PasswordHash = _passwordHasher.HashPassword(newPassword);
        await _context.SaveChangesAsync();
        await _auditService.LogActionAsync(user.Id, "PASSWORD_RESET", $"Password reset for user {user.Username} by admin.");

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpGet("audit-logs")]
    public async Task<ActionResult> GetAuditLogs(
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var query = _context.AuditLogs
            .Include(l => l.User)
            .AsQueryable();

        // Search Filter (Username, Action, Details)
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(l => 
                (l.User != null && l.User.Username.Contains(search)) || 
                l.Action.Contains(search) || 
                l.Details.Contains(search));
        }

        // Role Filter
        if (!string.IsNullOrEmpty(role) && role.ToLower() != "all")
        {
            query = query.Where(l => l.User != null && l.User.Role == role.ToLower());
        }

        // Date Range Filter
        if (dateFrom.HasValue)
        {
            query = query.Where(l => l.Timestamp >= dateFrom.Value);
        }
        if (dateTo.HasValue)
        {
            // End of day
            var endOfDay = dateTo.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.Timestamp <= endOfDay);
        }

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Take(200) // Increase limit slightly
            .Select(l => new 
            {
                l.Id,
                l.Action,
                l.Details,
                l.Timestamp,
                l.IpAddress,
                UserName = l.User != null ? l.User.Username : "System",
                Role = l.User != null ? l.User.Role : "System"
            })
            .ToListAsync();

        return Ok(logs);
    }

    // --- REPORTS ---

    [HttpGet("reports")]
    public async Task<ActionResult> GetReports()
    {
        var today = DateTime.Today;
        var startOfYear = new DateTime(today.Year, 1, 1);

        // 1. Monthly Revenue (Current Year)
        // GroupBy might fail if translated to SQL directly with Date properties depending on provider
        // Fetching required data and grouping in memory for simplicity if small data, 
        // but let's try SQL translation first.
        var payments = await _context.Payments
            .Where(p => p.PaymentDate >= startOfYear)
            .Select(p => new { p.PaymentDate, p.Amount })
            .ToListAsync();

        var revenueByMonth = payments
            .GroupBy(p => p.PaymentDate.Month)
            .Select(g => new
            {
                Month = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key),
                Revenue = g.Sum(p => p.Amount)
            })
            .ToList();

        // 2. Appointments by Doctor (All time or this year?) Let's do this year.
        var doctorStats = await _context.Appointments
            .Include(a => a.Doctor)
            .Where(a => a.AppointmentDate >= DateOnly.FromDateTime(startOfYear))
            .GroupBy(a => a.Doctor.FullName)
            .Select(g => new
            {
                DoctorName = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        // 3. Patient Growth (by month)
        var newPatients = await _context.Patients
            .Include(p => p.User)
            .Where(p => p.User.CreatedAt >= startOfYear)
            .Select(p => p.User.CreatedAt)
            .ToListAsync();
            
        var patientsByMonth = newPatients
            .GroupBy(u => u.Month)
            .Select(g => new 
            {
                Month = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key),
                Count = g.Count()
            })
            .ToList();

        return Ok(new 
        { 
            revenueByMonth, 
            doctorStats,
            patientsByMonth
        });
    }


    // --- PATIENTS ---

    [HttpGet("patients")]
    public async Task<ActionResult> GetPatientsAdmin()
    {
        var patients = await _context.Patients
            .Include(p => p.User)
            .OrderByDescending(p => p.User.CreatedAt)
            .Select(p => new 
            {
                p.Id,
                p.FullName,
                p.Phone,
                p.Gender,
                p.BirthDate,
                UserId = p.User.Id,
                Username = p.User.Username,
                CreatedAt = p.User.CreatedAt,
                IsActive = p.User.IsActive
            })
            .ToListAsync();
        return Ok(patients);
    }
}

public class TreatmentModel
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Icon { get; set; }
}

public class SystemSettingModel
{
    public string Key { get; set; }
    public string Value { get; set; }
    public string? Description { get; set; }
}

public class CreateUserModel
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } // doctor, secretary
    public string Phone { get; set; }
    public string? Specialty { get; set; }
}
