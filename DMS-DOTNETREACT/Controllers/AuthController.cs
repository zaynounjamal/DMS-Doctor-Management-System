using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Models.BindingModels;
using DMS_DOTNETREACT.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public AuthController(ClinicDbContext context)
    {
        _context = context;
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

        if (user == null || user.PasswordHash != model.Password) // In real app, use hashing!
        {
            return Unauthorized("Invalid username or password");
        }

        if (!user.IsActive)
        {
            return Unauthorized("User is inactive");
        }

        var viewModel = new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role,
            Token = "dummy-token" // In real app, generate JWT
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
            PasswordHash = model.Password, // In real app, use hashing!
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

        var viewModel = new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role,
            Token = "dummy-token" // In real app, generate JWT
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
