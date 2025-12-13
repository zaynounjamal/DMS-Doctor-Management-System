using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DMS_DOTNETREACT.Controllers;

[Route("api/medical-notes")]
[ApiController]
[Authorize(Policy = "DoctorOnly")]
public class MedicalNotesController : ControllerBase
{
    private readonly ClinicDbContext _context;

    public MedicalNotesController(ClinicDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Add a medical note to an appointment
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> AddNote([FromBody] MedicalNote model)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        // Get doctor ID
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        // Verify appointment exists and belongs to this doctor
        var appointment = await _context.Appointments.FindAsync(model.AppointmentId);
        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        if (appointment.DoctorId != doctor.Id)
        {
            return Forbid("You can only add notes to your own appointments");
        }

        var note = new MedicalNote
        {
            AppointmentId = model.AppointmentId,
            DoctorId = doctor.Id,
            Note = model.Note,
            CreatedAt = DateTime.UtcNow,
            IsEdited = false
        };

        _context.MedicalNotes.Add(note);
        await _context.SaveChangesAsync();

        return Ok(note);
    }

    /// <summary>
    /// Edit an existing medical note (notes can be edited but not deleted)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> EditNote(int id, [FromBody] MedicalNote model)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        // Get doctor ID
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var note = await _context.MedicalNotes.FindAsync(id);
        if (note == null)
        {
            return NotFound("Medical note not found");
        }

        // Only the doctor who created the note can edit it
        if (note.DoctorId != doctor.Id)
        {
            return Forbid("You can only edit your own notes");
        }

        note.Note = model.Note;
        note.UpdatedAt = DateTime.UtcNow;
        note.IsEdited = true;

        await _context.SaveChangesAsync();

        return Ok(note);
    }

    /// <summary>
    /// Get all medical notes for a specific appointment
    /// </summary>
    [HttpGet("appointment/{appointmentId}")]
    public async Task<ActionResult> GetNotesByAppointment(int appointmentId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        // Get doctor ID
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        // Verify appointment belongs to this doctor
        var appointment = await _context.Appointments.FindAsync(appointmentId);
        if (appointment == null)
        {
            return NotFound("Appointment not found");
        }

        if (appointment.DoctorId != doctor.Id)
        {
            return Forbid("You can only view notes for your own appointments");
        }

        var notes = await _context.MedicalNotes
            .Include(n => n.Doctor)
            .Where(n => n.AppointmentId == appointmentId)
            .OrderBy(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Note,
                n.CreatedAt,
                n.UpdatedAt,
                n.IsEdited,
                DoctorName = n.Doctor.FullName
            })
            .ToListAsync();

        return Ok(notes);
    }

    /// <summary>
    /// Get all medical notes for a specific patient
    /// </summary>
    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult> GetNotesByPatient(int patientId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        // Get doctor ID
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var notes = await _context.MedicalNotes
            .Include(n => n.Doctor)
            .Include(n => n.Appointment)
            .Where(n => n.Appointment.PatientId == patientId && n.Appointment.DoctorId == doctor.Id)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Note,
                n.CreatedAt,
                n.UpdatedAt,
                n.IsEdited,
                DoctorName = n.Doctor.FullName,
                AppointmentDate = n.Appointment.AppointmentDate,
                AppointmentTime = n.Appointment.AppointmentTime
            })
            .ToListAsync();

        return Ok(notes);
    }
}
