using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TreatmentController : ControllerBase
{
    private readonly ClinicDbContext _context;
    private const int MAX_TREATMENTS = 6;

    public TreatmentController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all active treatments (public endpoint)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetTreatments()
    {
        var treatments = await _context.Treatments
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                t.Price,
                t.Icon
            })
            .ToListAsync();

        return Ok(treatments);
    }

    /// <summary>
    /// Get all treatments including inactive (secretary only)
    /// </summary>
    [HttpGet("all")]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> GetAllTreatments()
    {
        var treatments = await _context.Treatments
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(treatments);
    }

    /// <summary>
    /// Add a new treatment (secretary only, max 6 active)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> AddTreatment([FromBody] Treatment model)
    {
        // Check if we already have 6 active treatments
        var activeCount = await _context.Treatments.CountAsync(t => t.IsActive);
        if (activeCount >= MAX_TREATMENTS)
        {
            return BadRequest($"Maximum of {MAX_TREATMENTS} active treatments allowed. Please deactivate an existing treatment first.");
        }

        var treatment = new Treatment
        {
            Name = model.Name,
            Description = model.Description,
            Price = model.Price,
            Icon = model.Icon,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        return Ok(treatment);
    }

    /// <summary>
    /// Update a treatment (secretary only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> UpdateTreatment(int id, [FromBody] Treatment model)
    {
        var treatment = await _context.Treatments.FindAsync(id);
        if (treatment == null)
        {
            return NotFound("Treatment not found");
        }

        // If activating, check the limit
        if (!treatment.IsActive && model.IsActive)
        {
            var activeCount = await _context.Treatments.CountAsync(t => t.IsActive && t.Id != id);
            if (activeCount >= MAX_TREATMENTS)
            {
                return BadRequest($"Maximum of {MAX_TREATMENTS} active treatments allowed.");
            }
        }

        treatment.Name = model.Name;
        treatment.Description = model.Description;
        treatment.Price = model.Price;
        treatment.Icon = model.Icon;
        treatment.IsActive = model.IsActive;

        await _context.SaveChangesAsync();

        return Ok(treatment);
    }

    /// <summary>
    /// Delete/deactivate a treatment (secretary only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "SecretaryOnly")]
    public async Task<ActionResult> DeleteTreatment(int id)
    {
        var treatment = await _context.Treatments.FindAsync(id);
        if (treatment == null)
        {
            return NotFound("Treatment not found");
        }

        // Soft delete - just deactivate
        treatment.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Treatment deactivated successfully" });
    }
}
