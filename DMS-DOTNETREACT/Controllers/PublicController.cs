using DMS_DOTNETREACT.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}
