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
        try 
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["Email:From"] ?? "noreply@clinic.com"));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            // Use configuration for SMTP settings
            var host = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var portStr = _configuration["Email:SmtpPort"] ?? "587";
            var port = int.Parse(portStr);
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];

            if (!string.IsNullOrEmpty(username))
            {
                await smtp.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(username, password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            else
            {
                // Log or simulate sending if no credentials
                Console.WriteLine($"[Email Simulation] To: {toEmail}, Subject: {subject}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email: {ex.Message}");
            // Don't throw, just log
        }
    }
}
