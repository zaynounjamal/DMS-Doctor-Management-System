using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class EmailTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty; // e.g., "Welcome", "AppointmentReminder"

    [Required]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Body { get; set; } = string.Empty; // HTML content with placeholders like {{Name}}

    public string Description { get; set; } = string.Empty; // For admin UI help text

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
