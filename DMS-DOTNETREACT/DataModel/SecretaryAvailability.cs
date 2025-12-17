using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class SecretaryAvailability
{
    [Key]
    public int SecretaryId { get; set; }

    public Secretary Secretary { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
