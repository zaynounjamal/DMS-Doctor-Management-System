using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class PatientTreatment
{
    public int Id { get; set; }

    public int PatientId { get; set; }
    public int TreatmentId { get; set; }
    public int? AppointmentId { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "pending"; // pending, completed, cancelled

    public Patient Patient { get; set; } = null!;
    public Treatment Treatment { get; set; } = null!;
    public Appointment? Appointment { get; set; }
}
