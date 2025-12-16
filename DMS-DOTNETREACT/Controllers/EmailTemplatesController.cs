using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "admin")]
public class EmailTemplatesController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public EmailTemplatesController(ClinicDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmailTemplate>>> GetTemplates()
    {
        return await _context.EmailTemplates.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EmailTemplate>> GetTemplate(int id)
    {
        var template = await _context.EmailTemplates.FindAsync(id);

        if (template == null)
        {
            return NotFound();
        }

        return template;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, EmailTemplate template)
    {
        if (id != template.Id)
        {
            return BadRequest();
        }

        // Only allow updating Subject and Body
        var existing = await _context.EmailTemplates.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Subject = template.Subject;
        existing.Body = template.Body;
        existing.LastUpdated = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmailTemplateExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    private bool EmailTemplateExists(int id)
    {
        return _context.EmailTemplates.Any(e => e.Id == id);
    }
}
