using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Doctor
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Specialty { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(300)]
    public string? ProfilePhoto { get; set; }

    public TimeOnly? StartHour { get; set; }
    public TimeOnly? EndHour { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalNote> MedicalNotes { get; set; } = new List<MedicalNote>();
}

