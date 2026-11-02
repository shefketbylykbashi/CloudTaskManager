using System.ComponentModel.DataAnnotations;
using CloudTask.Models;

namespace CloudTask.DTOs
{
    public class UpdateTaskRequest
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [EnumDataType(typeof(TaskItemStatus))]
        public TaskItemStatus? Status { get; set; }

        [Required]
        [EnumDataType(typeof(TaskPriority))]
        public TaskPriority? Priority { get; set; }

        public DateTimeOffset? DueDate { get; set; }
    }
}
