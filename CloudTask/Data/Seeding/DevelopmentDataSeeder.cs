using CloudTask.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudTask.Data.Seeding
{
    public class DevelopmentDataSeeder
    {
        private readonly CloudTaskDbContext _dbContext;
        private readonly TimeProvider _timeProvider;
        private readonly ILogger<DevelopmentDataSeeder> _logger;

        public DevelopmentDataSeeder(
            CloudTaskDbContext dbContext,
            TimeProvider timeProvider,
            ILogger<DevelopmentDataSeeder> logger)
        {
            _dbContext = dbContext;
            _timeProvider = timeProvider;
            _logger = logger;
        }

        public async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            if (await _dbContext.TaskItems.AnyAsync(cancellationToken))
            {
                _logger.LogInformation("Development seed skipped because task data already exists.");
                return;
            }

            var utcNow = _timeProvider.GetUtcNow().UtcDateTime;
            var taskItems = new[]
            {
                CreateTask("Plan project milestones", "Break the semester project into deliverables.", TaskItemStatus.Completed, TaskPriority.High, utcNow.AddDays(-18), utcNow.AddDays(-30)),
                CreateTask("Design database schema", "Review fields, indexes, and constraints.", TaskItemStatus.Completed, TaskPriority.High, utcNow.AddDays(-12), utcNow.AddDays(-25)),
                CreateTask("Configure Azure SQL", "Set the firewall rule and store the connection string securely.", TaskItemStatus.InProgress, TaskPriority.High, utcNow.AddDays(2), utcNow.AddDays(-10)),
                CreateTask("Implement create endpoint", "Add validation and return a Location header.", TaskItemStatus.Completed, TaskPriority.Medium, utcNow.AddDays(-3), utcNow.AddDays(-14)),
                CreateTask("Implement task filtering", "Support status, priority, and search filters.", TaskItemStatus.InProgress, TaskPriority.High, utcNow.AddDays(4), utcNow.AddDays(-8)),
                CreateTask("Add pagination", "Keep pagination inside the database query.", TaskItemStatus.Pending, TaskPriority.Medium, utcNow.AddDays(7), utcNow.AddDays(-6)),
                CreateTask("Build dashboard statistics", "Calculate status totals and overdue work.", TaskItemStatus.Pending, TaskPriority.High, utcNow.AddDays(5), utcNow.AddDays(-4)),
                CreateTask("Write integration tests", "Exercise the HTTP API with a local SQLite database.", TaskItemStatus.InProgress, TaskPriority.High, utcNow.AddDays(8), utcNow.AddDays(-3)),
                CreateTask("Review Swagger documentation", null, TaskItemStatus.Pending, TaskPriority.Low, utcNow.AddDays(10), utcNow.AddDays(-2)),
                CreateTask("Prepare frontend contract", "Share endpoint examples with the frontend team.", TaskItemStatus.Pending, TaskPriority.Medium, utcNow.AddDays(12), utcNow.AddDays(-1)),
                CreateTask("Fix overdue validation notes", "Resolve feedback from the first project review.", TaskItemStatus.Pending, TaskPriority.High, utcNow.AddDays(-1), utcNow.AddDays(-9)),
                CreateTask("Archive meeting notes", null, TaskItemStatus.Completed, TaskPriority.Low, null, utcNow.AddDays(-20)),
                CreateTask("Optimize list query", "Inspect generated SQL and confirm indexes are used.", TaskItemStatus.Pending, TaskPriority.Medium, null, utcNow.AddHours(-18)),
                CreateTask("Record demo video", "Demonstrate CRUD, search, and dashboard statistics.", TaskItemStatus.Pending, TaskPriority.Medium, utcNow.AddDays(14), utcNow.AddHours(-8)),
                CreateTask("Submit final report", "Include architecture, deployment steps, and test results.", TaskItemStatus.Pending, TaskPriority.High, utcNow.AddDays(18), utcNow)
            };

            _dbContext.TaskItems.AddRange(taskItems);
            await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Inserted {TaskCount} development sample tasks.", taskItems.Length);
        }

        private static TaskItem CreateTask(
            string title,
            string? description,
            TaskItemStatus status,
            TaskPriority priority,
            DateTime? dueDate,
            DateTime createdAt)
        {
            return new TaskItem
            {
                Title = title,
                Description = description,
                Status = status,
                Priority = priority,
                DueDate = dueDate,
                CreatedAt = createdAt,
                UpdatedAt = status == TaskItemStatus.Pending ? null : createdAt.AddHours(6)
            };
        }
    }
}
