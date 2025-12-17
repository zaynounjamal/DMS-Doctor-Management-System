using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class ChatConversation
{
    [Key]
    public int Id { get; set; }

    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public int? AssignedSecretaryId { get; set; }
    public Secretary? AssignedSecretary { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "waiting";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ClosedAt { get; set; }

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
