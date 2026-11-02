using CloudTask.DTOs;

namespace CloudTask.Services
{
    public interface ITaskService
    {
        Task<TaskResponse> CreateAsync(
            CreateTaskRequest request,
            CancellationToken cancellationToken);

        Task<PaginatedResponse<TaskResponse>> GetAsync(
            TaskQueryParameters queryParameters,
            CancellationToken cancellationToken);

        Task<TaskResponse?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken);

        Task<TaskResponse?> UpdateAsync(
            int id,
            UpdateTaskRequest request,
            CancellationToken cancellationToken);

        Task<TaskResponse?> UpdateStatusAsync(
            int id,
            UpdateTaskStatusRequest request,
            CancellationToken cancellationToken);

        Task<bool> DeleteAsync(
            int id,
            CancellationToken cancellationToken);

        Task<TaskStatsResponse> GetStatsAsync(CancellationToken cancellationToken);
    }
}
