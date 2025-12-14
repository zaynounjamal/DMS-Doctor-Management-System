using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class AddOffDayDto
{
    [Required]
    public string OffDate { get; set; } = string.Empty; // Receive as string to handle format manually if needed
    
    public string? Reason { get; set; }
}
