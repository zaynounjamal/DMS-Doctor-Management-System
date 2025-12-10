using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class Secretary
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

