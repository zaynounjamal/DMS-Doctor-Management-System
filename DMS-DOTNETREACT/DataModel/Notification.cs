using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required, MaxLength(255)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

