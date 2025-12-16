using DMS_DOTNETREACT.Data;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Services;

public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationBackgroundService> _logger;

    public NotificationBackgroundService(IServiceProvider serviceProvider, ILogger<NotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendReminders();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing automated reminders.");
            }

            // Wait 24 hours (or run at specific time)
            // For now, we wait 24h. In production you'd calculate time to next 8 AM.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task CheckAndSendReminders()
    {
        _logger.LogInformation("Checking for tomorrow's appointments...");

        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var tomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
            
            var appointments = await context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Include(a => a.Doctor)
                .Where(a => a.AppointmentDate == tomorrow && a.Status == "Scheduled")
                .ToListAsync();

            _logger.LogInformation($"Found {appointments.Count} appointments for {tomorrow}.");

            foreach (var appointment in appointments)
            {
                var email = appointment.Patient?.User?.Email;
                if (!string.IsNullOrEmpty(email))
                {
                    try
                    {
                        var subject = $"Reminder: Appointment Tomorrow with Dr. {appointment.Doctor.FullName}";
                        var body = $@"
                            <h3>Appointment Reminder</h3>
                            <p>Dear {appointment.Patient.FullName},</p>
                            <p>This is a reminder that you have an appointment tomorrow.</p>
                            <p><strong>Date:</strong> {appointment.AppointmentDate:d}</p>
                            <p><strong>Time:</strong> {appointment.AppointmentTime}</p>
                            <br/>
                            <p>Please reply if you need to reschedule.</p>
                            <p>Clinic Team</p>
                        ";

                        await emailService.SendEmailAsync(email, subject, body);
                        _logger.LogInformation($"Sent reminder to {email}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to send email to {email}");
                    }
                }
            }
        }
    }
}
