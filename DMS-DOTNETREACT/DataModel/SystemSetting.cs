using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class SystemSetting
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Key { get; set; } // e.g., "ClinicName", "Phone", "Address"

    [Required]
    [MaxLength(500)]
    public string Value { get; set; } // e.g., "My Clinic", "555-1234"

    public string? Description { get; set; } // Optional description of the setting
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
