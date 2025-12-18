using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class UpdateDoctorProfileBindingModel
{
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(50)]
    public string Specialty { get; set; } = string.Empty;

    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    public string? StartHour { get; set; }

    public string? EndHour { get; set; }

    public string? ProfilePhoto { get; set; }
}
