using System.ComponentModel.DataAnnotations;
using DMS_DOTNETREACT.Validation;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class SignupBindingModel
{
    [Required]
    [ValidUsername]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StrongPassword(MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [ValidPhone]
    public string Phone { get; set; } = string.Empty;

    [RegularExpression("^(Male|Female|Other)$", ErrorMessage = "Gender must be Male, Female, or Other")]
    public string? Gender { get; set; }

    public DateOnly? BirthDate { get; set; }
}
