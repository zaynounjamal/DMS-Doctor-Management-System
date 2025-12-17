using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using DMS_DOTNETREACT.Validation;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class SignupBindingModel
{
    [Required]
    [ValidUsername]
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StrongPassword(MinimumLength = 8)]
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [ValidPhone]
    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [RegularExpression("^(Male|Female|Other)$", ErrorMessage = "Gender must be Male, Female, or Other")]
    [JsonPropertyName("gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("birthDate")]
    public DateOnly? BirthDate { get; set; }
}
