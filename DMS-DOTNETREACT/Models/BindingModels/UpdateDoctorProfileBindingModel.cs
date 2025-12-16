using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class UpdateDoctorProfileBindingModel
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    [StringLength(50)]
    public string Specialty { get; set; } = string.Empty;

    [Required]
    [Phone]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    public TimeOnly StartHour { get; set; }

    public TimeOnly EndHour { get; set; }

    public string? ProfilePhoto { get; set; }
}
