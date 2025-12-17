using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.DataModel;

public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    public int ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;

    public int SenderUserId { get; set; }

    [Required, MaxLength(20)]
    public string SenderRole { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Text { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }
}
