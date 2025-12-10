using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class LoginBindingModel
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}
