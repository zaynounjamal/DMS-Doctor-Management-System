using System.ComponentModel.DataAnnotations;

namespace DMS_DOTNETREACT.Models.BindingModels;

public class AddMedicalNoteDto
{
    [Required]
    public int AppointmentId { get; set; }
    
    [Required]
    public string Note { get; set; } = string.Empty;
}

public class EditMedicalNoteDto
{
    [Required]
    public string Note { get; set; } = string.Empty;
}
