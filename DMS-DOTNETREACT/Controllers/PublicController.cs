using DMS_DOTNETREACT.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/public")]
[ApiController]
public class PublicController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public PublicController(ClinicDbContext context)
    {
        _context = context;
    }

    public record PublicTreatmentDto(int Id, string Name, string? Description, string? Icon);
    public record PublicDoctorDto(int Id, string FullName, string? Specialty, string? ProfilePhoto, string? StartHour, string? EndHour);

    [HttpGet("settings")]
    public async Task<ActionResult> GetSettings()
    {
        var settings = await _context.SystemSettings.ToListAsync();
        var result = new Dictionary<string, string>();
        foreach (var s in settings)
        {
            result[s.Key] = s.Value; // e.g. "LogoUrl", "HeroTitle"
        }
        return Ok(result);
    }

    [HttpGet("clinic/treatments")]
    public async Task<ActionResult> GetPublicTreatments()
    {
        var treatments = await _context.Treatments
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new PublicTreatmentDto(t.Id, t.Name, t.Description, t.Icon))
            .ToListAsync();

        return Ok(treatments);
    }

    [HttpGet("clinic/doctors")]
    public async Task<ActionResult> GetPublicDoctors()
    {
        var doctors = await _context.Doctors
            .Include(d => d.User)
            .AsNoTracking()
            .Where(d => d.User.IsActive)
            .OrderBy(d => d.FullName)
            .Select(d => new PublicDoctorDto(
                d.Id,
                d.FullName,
                d.Specialty,
                d.ProfilePhoto,
                d.StartHour.HasValue ? d.StartHour.Value.ToString("HH:mm") : null,
                d.EndHour.HasValue ? d.EndHour.Value.ToString("HH:mm") : null
            ))
            .ToListAsync();

        return Ok(doctors);
    }

    [HttpGet("clinic/available-dates")]
    public async Task<ActionResult> GetPublicAvailableDates([FromQuery] int doctorId)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null || !doctor.User.IsActive)
        {
            return NotFound("Doctor not found");
        }

        var today = DateOnly.FromDateTime(DateTime.Today);
        var endDate = today.AddDays(30);

        var offDays = await _context.OffDays
            .AsNoTracking()
            .Where(od => od.CreatedByUser == doctor.UserId && od.OffDate >= today && od.OffDate <= endDate)
            .Select(od => od.OffDate)
            .ToListAsync();

        var holidays = await _context.Holidays
            .AsNoTracking()
            .Where(h => h.IsRecurring || (h.Date >= today && h.Date <= endDate))
            .ToListAsync();

        var availableDates = new List<DateOnly>();
        for (var date = today; date <= endDate; date = date.AddDays(1))
        {
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            if (offDays.Contains(date))
                continue;

            if (holidays.Any(h => (h.IsRecurring && h.Date.Month == date.Month && h.Date.Day == date.Day) || (!h.IsRecurring && h.Date == date)))
                continue;

            availableDates.Add(date);
        }

        return Ok(availableDates);
    }

    [HttpGet("clinic/time-slots")]
    public async Task<ActionResult> GetPublicTimeSlots([FromQuery] int doctorId, [FromQuery] string dateStr)
    {
        if (doctorId <= 0)
        {
            return BadRequest("Valid doctorId is required");
        }

        if (string.IsNullOrWhiteSpace(dateStr))
        {
            return BadRequest("dateStr is required");
        }

        var doctor = await _context.Doctors
            .Include(d => d.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null || !doctor.User.IsActive)
        {
            return NotFound("Doctor not found");
        }

        DateOnly parsedDate;
        if (DateOnly.TryParseExact(dateStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
        {
        }
        else if (DateTime.TryParse(dateStr, out var dt))
        {
            parsedDate = DateOnly.FromDateTime(dt);
        }
        else
        {
            return BadRequest($"Invalid date format: {dateStr}. Please use yyyy-MM-dd.");
        }

        var isOffDay = await _context.OffDays
            .AsNoTracking()
            .AnyAsync(od => od.CreatedByUser == doctor.UserId && od.OffDate == parsedDate);

        if (isOffDay)
        {
            return Ok(new List<object>());
        }

        var holidays = await _context.Holidays
            .AsNoTracking()
            .Where(h => h.IsRecurring || h.Date == parsedDate)
            .ToListAsync();

        var isHoliday = holidays.Any(h => (h.IsRecurring && h.Date.Month == parsedDate.Month && h.Date.Day == parsedDate.Day) || (!h.IsRecurring && h.Date == parsedDate));
        if (isHoliday)
        {
            return Ok(new List<object>());
        }

        var existingAppointments = await _context.Appointments
            .AsNoTracking()
            .Where(a => a.DoctorId == doctorId && a.AppointmentDate == parsedDate && (a.Status ?? "").ToLower() != "cancelled")
            .Select(a => a.AppointmentTime)
            .ToListAsync();

        var startTime = doctor.StartHour ?? new TimeOnly(9, 0);
        var endTime = doctor.EndHour ?? new TimeOnly(17, 0);

        var isToday = parsedDate == DateOnly.FromDateTime(DateTime.Today);
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);

        var timeSlots = new List<object>();
        var currentTime = startTime;
        while (currentTime < endTime)
        {
            var isReserved = existingAppointments.Contains(currentTime);
            var isPastSlot = isToday && currentTime < nowTime;

            timeSlots.Add(new
            {
                Time = currentTime.ToString("HH:mm"),
                DisplayTime = currentTime.ToString("h:mm tt", CultureInfo.InvariantCulture),
                IsAvailable = !isReserved && !isPastSlot
            });

            currentTime = currentTime.AddMinutes(30);
        }

        return Ok(timeSlots);
    }

    [HttpGet("clinic/payment-info")]
    public async Task<ActionResult> GetPublicPaymentInfo()
    {
        var methods = await _context.Payments
            .AsNoTracking()
            .Where(p => p.PaymentMethod != null && p.PaymentMethod != "")
            .Select(p => p.PaymentMethod!)
            .Distinct()
            .OrderBy(m => m)
            .ToListAsync();

        if (methods.Count == 0)
        {
            methods = new List<string> { "cash", "card" };
        }

        return Ok(new
        {
            paymentMethods = methods,
            noteEn = "Pricing is not available via chat. For price details, please contact the clinic.",
            noteAr = "الأسعار غير متاحة عبر الدردشة. لمعرفة الأسعار يرجى التواصل مع العيادة."
        });
    }

    [HttpGet("faq")]
    public ActionResult GetFaq()
    {
        return Ok(new[]
        {
            new
            {
                key = "book_appointment",
                questionEn = "How can I book an appointment?",
                answerEn = "Choose a doctor, pick an available date and time, then confirm your booking.",
                questionAr = "كيف يمكنني حجز موعد؟",
                answerAr = "اختر الطبيب، ثم اختر تاريخاً ووقتاً متاحين، ثم قم بتأكيد الحجز."
            },
            new
            {
                key = "cancel_appointment",
                questionEn = "Can I cancel or reschedule my appointment?",
                answerEn = "Yes. If rescheduling is available in your account, you can do it from your appointments. Otherwise, contact the clinic.",
                questionAr = "هل يمكنني إلغاء أو تغيير موعدي؟",
                answerAr = "نعم. إذا كانت ميزة تغيير الموعد متاحة في حسابك يمكنك ذلك من صفحة المواعيد. وإلا يرجى التواصل مع العيادة."
            },
            new
            {
                key = "payment_methods",
                questionEn = "What payment methods are supported?",
                answerEn = "Payment methods depend on the clinic configuration. You can ask for the supported methods.",
                questionAr = "ما هي طرق الدفع المتاحة؟",
                answerAr = "طرق الدفع تعتمد على إعدادات العيادة. يمكنك سؤالنا عن طرق الدفع المتاحة."
            }
        });
    }
}
