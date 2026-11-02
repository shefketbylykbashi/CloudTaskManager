using CloudTask.Data;
using CloudTask.DTOs;
using CloudTask.Mapping;
using CloudTask.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudTask.Services
{
    public class TaskService : ITaskService
    {
        private readonly CloudTaskDbContext _dbContext;
        private readonly TimeProvider _timeProvider;
        private readonly ILogger<TaskService> _logger;

        public TaskService(
            CloudTaskDbContext dbContext,
            TimeProvider timeProvider,
            ILogger<TaskService> logger)
        {
            _dbContext = dbContext;
            _timeProvider = timeProvider;
            _logger = logger;
        }

        public async Task<TaskResponse> CreateAsync(
            CreateTaskRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = new TaskItem
            {
                Title = request.Title.Trim(),
                Description = NormalizeDescription(request.Description),
                Status = request.Status!.Value,
                Priority = request.Priority!.Value,
                DueDate = request.DueDate?.UtcDateTime,
                CreatedAt = UtcNow()
            };

            _dbContext.TaskItems.Add(taskItem);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created task item {TaskItemId}.", taskItem.Id);
            return taskItem.ToResponse();
        }

        public async Task<PaginatedResponse<TaskResponse>> GetAsync(
            TaskQueryParameters queryParameters,
            CancellationToken cancellationToken)
        {
            IQueryable<TaskItem> query = _dbContext.TaskItems.AsNoTracking();

            if (queryParameters.Status.HasValue)
            {
                query = query.Where(taskItem => taskItem.Status == queryParameters.Status.Value);
            }

            if (queryParameters.Priority.HasValue)
            {
                query = query.Where(taskItem => taskItem.Priority == queryParameters.Priority.Value);
            }

            if (!string.IsNullOrWhiteSpace(queryParameters.Search))
            {
                var search = queryParameters.Search.Trim().ToLowerInvariant();
                query = query.Where(taskItem =>
                    taskItem.Title.ToLower().Contains(search) ||
                    (taskItem.Description != null && taskItem.Description.ToLower().Contains(search)));
            }

            var totalCount = await query.CountAsync(cancellationToken);
            query = ApplySorting(query, queryParameters.SortBy, queryParameters.SortDirection);

            var skip = (queryParameters.Page - 1) * queryParameters.PageSize;
            var taskItems = await query
                .Skip(skip)
                .Take(queryParameters.PageSize)
                .ToListAsync(cancellationToken);

            var items = taskItems.Select(taskItem => taskItem.ToResponse()).ToArray();

            return new PaginatedResponse<TaskResponse>(
                items,
                totalCount,
                queryParameters.Page,
                queryParameters.PageSize);
        }

        public async Task<TaskResponse?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken)
        {
            var taskItem = await _dbContext.TaskItems
                .AsNoTracking()
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            return taskItem?.ToResponse();
        }

        public async Task<TaskResponse?> UpdateAsync(
            int id,
            UpdateTaskRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = await _dbContext.TaskItems
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (taskItem is null)
            {
                return null;
            }

            taskItem.Title = request.Title.Trim();
            taskItem.Description = NormalizeDescription(request.Description);
            taskItem.Status = request.Status!.Value;
            taskItem.Priority = request.Priority!.Value;
            taskItem.DueDate = request.DueDate?.UtcDateTime;
            taskItem.UpdatedAt = UtcNow();

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated task item {TaskItemId}.", taskItem.Id);
            return taskItem.ToResponse();
        }

        public async Task<TaskResponse?> UpdateStatusAsync(
            int id,
            UpdateTaskStatusRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = await _dbContext.TaskItems
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (taskItem is null)
            {
                return null;
            }

            taskItem.Status = request.Status!.Value;
            taskItem.UpdatedAt = UtcNow();

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Changed task item {TaskItemId} status to {Status}.",
                taskItem.Id,
                taskItem.Status);

            return taskItem.ToResponse();
        }

        public async Task<bool> DeleteAsync(
            int id,
            CancellationToken cancellationToken)
        {
            var taskItem = await _dbContext.TaskItems
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (taskItem is null)
            {
                return false;
            }

            _dbContext.TaskItems.Remove(taskItem);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Deleted task item {TaskItemId}.", taskItem.Id);
            return true;
        }

        public async Task<TaskStatsResponse> GetStatsAsync(CancellationToken cancellationToken)
        {
            var utcNow = UtcNow();

            var counts = await _dbContext.TaskItems
                .AsNoTracking()
                .GroupBy(_ => 1)
                .Select(group => new
                {
                    TotalTasks = group.Count(),
                    PendingTasks = group.Count(item => item.Status == TaskItemStatus.Pending),
                    InProgressTasks = group.Count(item => item.Status == TaskItemStatus.InProgress),
                    CompletedTasks = group.Count(item => item.Status == TaskItemStatus.Completed),
                    OverdueTasks = group.Count(item =>
                        item.DueDate.HasValue &&
                        item.DueDate.Value < utcNow &&
                        item.Status != TaskItemStatus.Completed)
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (counts is null)
            {
                return new TaskStatsResponse();
            }

            var completionRate = counts.TotalTasks == 0
                ? 0m
                : Math.Round(
                    counts.CompletedTasks * 100m / counts.TotalTasks,
                    2,
                    MidpointRounding.AwayFromZero);

            return new TaskStatsResponse
            {
                TotalTasks = counts.TotalTasks,
                PendingTasks = counts.PendingTasks,
                InProgressTasks = counts.InProgressTasks,
                CompletedTasks = counts.CompletedTasks,
                OverdueTasks = counts.OverdueTasks,
                CompletionRate = completionRate
            };
        }

        private static IQueryable<TaskItem> ApplySorting(
            IQueryable<TaskItem> query,
            string? sortBy,
            string sortDirection)
        {
            var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
            var normalizedSortBy = sortBy?.Trim().ToLowerInvariant() ?? "createdat";

            IOrderedQueryable<TaskItem> orderedQuery = normalizedSortBy switch
            {
                "id" => descending
                    ? query.OrderByDescending(item => item.Id)
                    : query.OrderBy(item => item.Id),
                "title" => descending
                    ? query.OrderByDescending(item => item.Title)
                    : query.OrderBy(item => item.Title),
                "status" => descending
                    ? query.OrderByDescending(item =>
                        item.Status == TaskItemStatus.Completed ? 2 :
                        item.Status == TaskItemStatus.InProgress ? 1 : 0)
                    : query.OrderBy(item =>
                        item.Status == TaskItemStatus.Completed ? 2 :
                        item.Status == TaskItemStatus.InProgress ? 1 : 0),
                "priority" => descending
                    ? query.OrderByDescending(item =>
                        item.Priority == TaskPriority.High ? 2 :
                        item.Priority == TaskPriority.Medium ? 1 : 0)
                    : query.OrderBy(item =>
                        item.Priority == TaskPriority.High ? 2 :
                        item.Priority == TaskPriority.Medium ? 1 : 0),
                "duedate" => descending
                    ? query.OrderByDescending(item => item.DueDate)
                    : query.OrderBy(item => item.DueDate),
                "updatedat" => descending
                    ? query.OrderByDescending(item => item.UpdatedAt)
                    : query.OrderBy(item => item.UpdatedAt),
                _ => descending
                    ? query.OrderByDescending(item => item.CreatedAt)
                    : query.OrderBy(item => item.CreatedAt)
            };

            return descending
                ? orderedQuery.ThenByDescending(item => item.Id)
                : orderedQuery.ThenBy(item => item.Id);
        }

        private DateTime UtcNow()
        {
            return _timeProvider.GetUtcNow().UtcDateTime;
        }

        private static string? NormalizeDescription(string? description)
        {
            return string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        }
    }
}
