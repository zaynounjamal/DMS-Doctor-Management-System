using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Holiday
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public DateOnly Date { get; set; }
    
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public bool IsRecurring { get; set; } = false; // e.g. Christmas
}
