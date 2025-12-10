namespace DMS_DOTNETREACT.DataModel;

public class Payment
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int SecretaryId { get; set; }

    public DateTime PaidAt { get; set; } = DateTime.UtcNow;

    public Appointment Appointment { get; set; } = null!;
    public Secretary Secretary { get; set; } = null!;
}

