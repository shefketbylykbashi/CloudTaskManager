using CloudTask.DTOs;
using CloudTask.Models;

namespace CloudTask.Mapping
{
    public static class TaskMappings
    {
        public static TaskResponse ToResponse(this TaskItem taskItem)
        {
            return new TaskResponse
            {
                Id = taskItem.Id,
                Title = taskItem.Title,
                Description = taskItem.Description,
                Status = taskItem.Status,
                Priority = taskItem.Priority,
                DueDate = taskItem.DueDate,
                CreatedAt = taskItem.CreatedAt,
                UpdatedAt = taskItem.UpdatedAt
            };
        }
    }
}
