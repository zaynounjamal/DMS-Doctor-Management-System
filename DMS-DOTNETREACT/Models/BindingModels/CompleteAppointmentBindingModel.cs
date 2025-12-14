using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class CompleteAppointmentBindingModel
{
    [Required]
    public decimal FinalPrice { get; set; }
    
    [MaxLength(1000)]
    public string? CompletionNotes { get; set; }

    [Required]
    [RegularExpression("^(paid|unpaid)$", ErrorMessage = "Payment status must be 'paid' or 'unpaid'")]
    public string PaymentStatus { get; set; } = "unpaid";
}
