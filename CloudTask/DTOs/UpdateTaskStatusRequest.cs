using System.ComponentModel.DataAnnotations;
using CloudTask.Models;

namespace CloudTask.DTOs
{
    public class UpdateTaskStatusRequest
    {
        [Required]
        [EnumDataType(typeof(TaskItemStatus))]
        public TaskItemStatus? Status { get; set; }
    }
}
