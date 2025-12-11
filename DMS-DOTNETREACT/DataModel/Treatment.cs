using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Treatment
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(50)]
    public string? Icon { get; set; } // For UI display (emoji or icon name)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PatientTreatment> PatientTreatments { get; set; } = new List<PatientTreatment>();
}
