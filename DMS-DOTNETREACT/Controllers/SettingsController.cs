using DMS_DOTNETREACT.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SettingsController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public SettingsController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get Public Settings (Footer Info)
    /// </summary>
    [HttpGet("public")]
    public async Task<ActionResult> GetPublicSettings()
    {
        // We might want to filter only specific keys that are public safe
        // For now, let's expose all, assuming they are just contact info.
        var settings = await _context.SystemSettings
            .Select(s => new { s.Key, s.Value })
            .ToDictionaryAsync(s => s.Key, s => s.Value);

        return Ok(settings);
    }
}
