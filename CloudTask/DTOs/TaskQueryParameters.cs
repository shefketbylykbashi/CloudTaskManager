using System.ComponentModel.DataAnnotations;
using CloudTask.Models;

namespace CloudTask.DTOs
{
    public class TaskQueryParameters : IValidatableObject
    {
        private static readonly HashSet<string> SupportedSortFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "id",
            "title",
            "status",
            "priority",
            "dueDate",
            "createdAt",
            "updatedAt"
        };

        [EnumDataType(typeof(TaskItemStatus))]
        public TaskItemStatus? Status { get; set; }

        [EnumDataType(typeof(TaskPriority))]
        public TaskPriority? Priority { get; set; }

        [StringLength(200)]
        public string? Search { get; set; }

        public string? SortBy { get; set; }

        public string SortDirection { get; set; } = "desc";

        [Range(1, 1_000_000)]
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!string.IsNullOrWhiteSpace(SortBy) && !SupportedSortFields.Contains(SortBy))
            {
                yield return new ValidationResult(
                    $"sortBy must be one of: {string.Join(", ", SupportedSortFields)}.",
                    new[] { nameof(SortBy) });
            }

            if (!string.Equals(SortDirection, "asc", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(SortDirection, "desc", StringComparison.OrdinalIgnoreCase))
            {
                yield return new ValidationResult(
                    "sortDirection must be either 'asc' or 'desc'.",
                    new[] { nameof(SortDirection) });
            }
        }
    }
}
