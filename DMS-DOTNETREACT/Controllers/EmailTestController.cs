using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "admin")]
public class EmailTestController : ControllerBase
{
    private readonly EmailService _emailService;

    public EmailTestController(EmailService emailService)
    {
        _emailService = emailService;
    }

    /// <summary>
    /// Send a test email - Admin only
    /// </summary>
    [HttpPost("send-test")]
    public async Task<ActionResult> SendTestEmail([FromBody] TestEmailRequest request)
    {
        if (string.IsNullOrEmpty(request.ToEmail))
        {
            return BadRequest("Email address is required");
        }

        try
        {
            await _emailService.SendEmailAsync(
                request.ToEmail,
                request.Subject ?? "Test Email from DMS",
                request.Body ?? "<h1>Test Email</h1><p>This is a test email from the DMS system.</p>"
            );

            return Ok(new { message = $"Test email sent successfully to {request.ToEmail}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to send email", error = ex.Message });
        }
    }
}

public class TestEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Body { get; set; }
}
