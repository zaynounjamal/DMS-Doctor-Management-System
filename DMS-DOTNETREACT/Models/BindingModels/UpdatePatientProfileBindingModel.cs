using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class UpdatePatientProfileBindingModel
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(10)]
    public string? Gender { get; set; }

    public DateOnly? BirthDate { get; set; }

    [MaxLength(300)]
    public string? ProfilePhoto { get; set; }
}
