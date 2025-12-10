namespace DMS_DOTNETREACT.DataModel;

public class OffDay
{
    public int Id { get; set; }
    public DateOnly OffDate { get; set; }
    public int CreatedByUser { get; set; }
    public string? Reason { get; set; }

    public User User { get; set; } = null!;
}

