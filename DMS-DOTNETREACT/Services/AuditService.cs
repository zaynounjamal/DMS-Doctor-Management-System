using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.Extensions.DependencyInjection;

namespace DMS_DOTNETREACT.Services;

public class AuditService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;

    public AuditService(IServiceProvider serviceProvider, Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
    {
        _serviceProvider = serviceProvider;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogActionAsync(int? userId, string action, string details, string? ipAddress = null)
    {
        try
        {
            // Auto-detect IP if not provided
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
                
                // If using localhost, it might look like ::1. Normalize it? 
                // Alternatively, check headers if behind proxy (X-Forwarded-For) - but Program.cs handles that with rate limits options?
                // For simplicity, let's just grab the connection IP.
            }

            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
                var log = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    Details = details,
                    IpAddress = ipAddress,
                    Timestamp = DateTime.UtcNow
                };
                context.AuditLogs.Add(log);
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            // Silently fail or log to file/console so we don't break the main flow
            Console.WriteLine($"Audit logging failed: {ex.Message}");
        }
    }
}
