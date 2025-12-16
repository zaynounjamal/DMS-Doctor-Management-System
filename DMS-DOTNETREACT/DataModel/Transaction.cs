using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Transaction
{
    public int Id { get; set; }
    
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public decimal Amount { get; set; }
    public string Type { get; set; } // "Deposit" or "Payment"
    public string Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CreatedByUserId { get; set; } // ID of secretary who performed action
}
