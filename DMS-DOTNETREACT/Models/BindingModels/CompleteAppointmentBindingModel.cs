using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class CompleteAppointmentBindingModel
{
    [Required]
    public decimal FinalPrice { get; set; }
    
    [MaxLength(1000)]
    public string? CompletionNotes { get; set; }
}
