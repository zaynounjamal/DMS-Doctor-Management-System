using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Patient
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? ProfilePhoto { get; set; }

    [MaxLength(10)]
    public string? Gender { get; set; }

    public DateOnly? BirthDate { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

