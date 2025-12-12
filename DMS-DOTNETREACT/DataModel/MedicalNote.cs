using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class MedicalNote
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }

    [Required]
    public string Note { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsEdited { get; set; } = false;

    public Appointment Appointment { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
}

