using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace DMS_DOTNETREACT.Validation;

/// <summary>
/// Validates that a password meets strong security requirements
/// </summary>
public class StrongPasswordAttribute : ValidationAttribute
{
    public int MinimumLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecialChar { get; set; } = true;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return new ValidationResult("Password is required");
        }

        string password = value.ToString()!;

        if (password.Length < MinimumLength)
        {
            return new ValidationResult($"Password must be at least {MinimumLength} characters long");
        }

        if (RequireUppercase && !Regex.IsMatch(password, @"[A-Z]"))
        {
            return new ValidationResult("Password must contain at least one uppercase letter");
        }

        if (RequireLowercase && !Regex.IsMatch(password, @"[a-z]"))
        {
            return new ValidationResult("Password must contain at least one lowercase letter");
        }

        if (RequireDigit && !Regex.IsMatch(password, @"\d"))
        {
            return new ValidationResult("Password must contain at least one digit");
        }

        if (RequireSpecialChar && !Regex.IsMatch(password, @"[!@#$%^&*(),.?""':{}|<>]"))
        {
            return new ValidationResult("Password must contain at least one special character");
        }

        return ValidationResult.Success;
    }
}

/// <summary>
/// Validates username format (alphanumeric and underscores only)
/// </summary>
public class ValidUsernameAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return new ValidationResult("Username is required");
        }

        string username = value.ToString()!;

        if (username.Length < 3)
        {
            return new ValidationResult("Username must be at least 3 characters long");
        }

        if (username.Length > 50)
        {
            return new ValidationResult("Username cannot exceed 50 characters");
        }

        if (!Regex.IsMatch(username, @"^[a-zA-Z0-9_]+$"))
        {
            return new ValidationResult("Username can only contain letters, numbers, and underscores");
        }

        return ValidationResult.Success;
    }
}

/// <summary>
/// Validates phone number format
/// </summary>
public class ValidPhoneAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return ValidationResult.Success; // Allow null/empty if not required
        }

        string phone = value.ToString()!;

        // Remove common separators
        phone = Regex.Replace(phone, @"[\s\-\(\)]", "");

        if (!Regex.IsMatch(phone, @"^\d{8,15}$"))
        {
            return new ValidationResult("Phone number must contain 8-15 digits");
        }

        return ValidationResult.Success;
    }
}
