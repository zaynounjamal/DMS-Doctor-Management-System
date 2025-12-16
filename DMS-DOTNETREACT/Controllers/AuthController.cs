using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Models.BindingModels;
using DMS_DOTNETREACT.Models.ViewModels;
using DMS_DOTNETREACT.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordHasher _passwordHasher;
    private readonly EmailService _emailService;

    public AuthController(ClinicDbContext context, JwtService jwtService, PasswordHasher passwordHasher, EmailService emailService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserViewModel>> Login([FromBody] LoginBindingModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == model.Username);

        if (user == null || !_passwordHasher.VerifyPassword(model.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid username or password");
        }

        if (!user.IsActive)
        {
            return Unauthorized("User is inactive");
        }

        var token = _jwtService.GenerateToken(user.Id, user.Username, user.Role);

        var viewModel = new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        return Ok(viewModel);
    }

    [HttpPost("signup")]
    public async Task<ActionResult<UserViewModel>> Signup([FromBody] SignupBindingModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (await _context.Users.AnyAsync(u => u.Username == model.Username))
        {
            return BadRequest("Username is already taken");
        }

        var user = new User
        {
            Username = model.Username,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            Email = model.Email,
            Role = "patient",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var patient = new Patient
        {
            FullName = model.FullName,
            Phone = model.Phone,
            Gender = model.Gender,
            BirthDate = model.BirthDate,
            User = user
        };

        _context.Users.Add(user);
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        // Send Welcome Email
        if (!string.IsNullOrEmpty(model.Email))
        {
            try
            {
                var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.Name == "WelcomeEmail");
                if (template != null)
                {
                    var body = template.Body
                        .Replace("{{FullName}}", patient.FullName)
                        .Replace("{{UserName}}", user.Username);

                    await _emailService.SendEmailAsync(model.Email, template.Subject, body);
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail signup
                Console.WriteLine($"Error sending welcome email: {ex.Message}");
            }
        }

        var token = _jwtService.GenerateToken(user.Id, user.Username, user.Role);

        var viewModel = new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        return CreatedAtAction(nameof(Login), new { }, viewModel);
    }

    [HttpGet("check-username")]
    public async Task<ActionResult<object>> CheckUsernameAvailability([FromQuery] string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty");
        }

        var exists = await _context.Users.AnyAsync(u => u.Username == username);
        return Ok(new { available = !exists });
    }
}
