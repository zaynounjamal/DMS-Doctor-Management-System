using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class BlockedPhoneNumber
{
    public int Id { get; set; }

    [Required, MaxLength(40)]
    public string NormalizedPhone { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? CreatedByUserId { get; set; }
}
