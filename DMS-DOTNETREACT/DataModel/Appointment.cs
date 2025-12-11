using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Appointment
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }

    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; } // Main appointment time
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "scheduled"; // scheduled, done, cancelled

    public decimal? Price { get; set; }

    [Required, MaxLength(20)]
    public string PaymentStatus { get; set; } = "unpaid"; // unpaid, paid

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(500)]
    public string? Notes { get; set; } // Patient notes for appointment

    [MaxLength(255)]
    public string? CancelReason { get; set; }

    [MaxLength(50)]
    public string? AppointmentType { get; set; }

    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Payment? Payment { get; set; }
    public ICollection<MedicalNote> MedicalNotes { get; set; } = new List<MedicalNote>();
}

