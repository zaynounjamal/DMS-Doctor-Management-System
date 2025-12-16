using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class AuditLog
{
    [Key]
    public int Id { get; set; }
    
    public int? UserId { get; set; } // Nullable as action might be system or unauthenticated (login attempt)
    
    [Required, MaxLength(50)]
    public string Action { get; set; } = string.Empty; // e.g. "USER_CREATED", "LOGIN_FAILED"
    
    [Required]
    public string Details { get; set; } = string.Empty; // JSON or text description
    
    [MaxLength(45)]
    public string? IpAddress { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public User? User { get; set; }
}
