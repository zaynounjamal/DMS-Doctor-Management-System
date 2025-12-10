using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = string.Empty; // patient, doctor, secretary

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    public Secretary? Secretary { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<OffDay> OffDays { get; set; } = new List<OffDay>();
}

