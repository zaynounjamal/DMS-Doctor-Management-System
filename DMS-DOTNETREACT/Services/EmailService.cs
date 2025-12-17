using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace DMS_DOTNETREACT.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new ArgumentException("Email address cannot be empty", nameof(toEmail));
        }

        try 
        {
            var email = new MimeMessage();
            var username = _configuration["Email:Username"];
            var fromConfig = _configuration["Email:From"];
            var fromNameConfig = _configuration["Email:FromName"];

            var fromAddress = !string.IsNullOrWhiteSpace(username)
                ? username
                : (string.IsNullOrWhiteSpace(fromConfig) ? "noreply@clinic.com" : fromConfig);

            var fromName = !string.IsNullOrWhiteSpace(fromNameConfig)
                ? fromNameConfig
                : (string.IsNullOrWhiteSpace(fromConfig) || fromConfig.Contains('@') ? "" : fromConfig);

            email.From.Add(new MailboxAddress(fromName, fromAddress));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            // Use configuration for SMTP settings
            var host = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var portStr = _configuration["Email:SmtpPort"] ?? "587";
            var port = int.Parse(portStr);
            var password = _configuration["Email:Password"];

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                await smtp.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(username, password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                Console.WriteLine($"[EmailService] Successfully sent email to {toEmail}");
            }
            else
            {
                // Log simulation if no credentials configured
                Console.WriteLine($"[EmailService] [SIMULATION MODE] To: {toEmail}, Subject: {subject}");
                Console.WriteLine($"[EmailService] Email credentials not configured. Please set Email:Username and Email:Password in appsettings.json");
                // In development, we might want to allow this, but in production we should throw
                // For now, we'll throw to make it clear emails aren't being sent
                throw new InvalidOperationException("Email service is not configured. Please set Email:Username and Email:Password in appsettings.json");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Failed to send email to {toEmail}: {ex.Message}");
            Console.WriteLine($"[EmailService] StackTrace: {ex.StackTrace}");
            throw; // Re-throw so the caller knows it failed
        }
    }
}
