using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CloudTask.DTOs;
using CloudTask.IntegrationTests.Infrastructure;
using CloudTask.Models;

namespace CloudTask.IntegrationTests;

public sealed class TaskCrudTests : IntegrationTestBase
{
    [Fact]
    public async Task CreateAndGet_ReturnPersistedTaskWithStringEnumsAndLocation()
    {
        var dueDate = new DateTimeOffset(2026, 11, 15, 12, 0, 0, TimeSpan.FromHours(2));
        var request = new CreateTaskRequest
        {
            Title = "  Complete Azure SQL Project  ",
            Description = "  Implement and test CRUD endpoints  ",
            Status = TaskItemStatus.Pending,
            Priority = TaskPriority.High,
            DueDate = dueDate
        };

        var response = await Client.PostAsJsonAsync("/api/tasks", request, JsonOptions);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using (var document = JsonDocument.Parse(json))
        {
            Assert.Equal("Pending", document.RootElement.GetProperty("status").GetString());
            Assert.Equal("High", document.RootElement.GetProperty("priority").GetString());
        }

        var created = JsonSerializer.Deserialize<TaskResponse>(json, JsonOptions);
        Assert.NotNull(created);
        Assert.True(created.Id > 0);
        Assert.Equal("Complete Azure SQL Project", created.Title);
        Assert.Equal("Implement and test CRUD endpoints", created.Description);
        Assert.Equal(new DateTime(2026, 11, 15, 10, 0, 0, DateTimeKind.Utc), created.DueDate);
        Assert.Equal(CloudTaskApiFactory.DefaultUtcNow.UtcDateTime, created.CreatedAt);
        Assert.Null(created.UpdatedAt);
        Assert.NotNull(response.Headers.Location);
        Assert.EndsWith($"/api/tasks/{created.Id}", response.Headers.Location.ToString());

        var getResponse = await Client.GetAsync(response.Headers.Location);
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var retrieved = await getResponse.Content.ReadFromJsonAsync<TaskResponse>(JsonOptions);
        Assert.NotNull(retrieved);
        Assert.Equal(created.Id, retrieved.Id);
        Assert.Equal(created.Title, retrieved.Title);
        Assert.Equal(created.CreatedAt, retrieved.CreatedAt);
    }

    [Fact]
    public async Task PutAndPatch_UpdateEditableFieldsAndTimestamps()
    {
        var created = await CreateTaskAsync(
            "Original",
            TaskItemStatus.Pending,
            TaskPriority.High,
            "Original description");

        var updateTime = CloudTaskApiFactory.DefaultUtcNow.AddHours(1);
        Factory.Clock.SetUtcNow(updateTime);

        var putResponse = await Client.PutAsJsonAsync(
            $"/api/tasks/{created.Id}",
            new UpdateTaskRequest
            {
                Title = "  Updated task  ",
                Description = "   ",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.Low,
                DueDate = new DateTimeOffset(2026, 11, 20, 8, 30, 0, TimeSpan.Zero)
            },
            JsonOptions);

        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);
        var updated = await putResponse.Content.ReadFromJsonAsync<TaskResponse>(JsonOptions);
        Assert.NotNull(updated);
        Assert.Equal("Updated task", updated.Title);
        Assert.Null(updated.Description);
        Assert.Equal(TaskItemStatus.InProgress, updated.Status);
        Assert.Equal(TaskPriority.Low, updated.Priority);
        Assert.Equal(created.CreatedAt, updated.CreatedAt);
        Assert.Equal(updateTime.UtcDateTime, updated.UpdatedAt);

        var patchTime = updateTime.AddHours(1);
        Factory.Clock.SetUtcNow(patchTime);

        var patchResponse = await Client.PatchAsJsonAsync(
            $"/api/tasks/{created.Id}/status",
            new UpdateTaskStatusRequest { Status = TaskItemStatus.Completed },
            JsonOptions);

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);
        var patched = await patchResponse.Content.ReadFromJsonAsync<TaskResponse>(JsonOptions);
        Assert.NotNull(patched);
        Assert.Equal(TaskItemStatus.Completed, patched.Status);
        Assert.Equal("Updated task", patched.Title);
        Assert.Equal(TaskPriority.Low, patched.Priority);
        Assert.Equal(patchTime.UtcDateTime, patched.UpdatedAt);

        var persisted = await Client.GetFromJsonAsync<TaskResponse>(
            $"/api/tasks/{created.Id}",
            JsonOptions);
        Assert.NotNull(persisted);
        Assert.Equal(TaskItemStatus.Completed, persisted.Status);
        Assert.Equal(patchTime.UtcDateTime, persisted.UpdatedAt);
    }

    [Fact]
    public async Task Delete_RemovesTaskAndReturnsNoContent()
    {
        var created = await CreateTaskAsync("Delete me");

        var deleteResponse = await Client.DeleteAsync($"/api/tasks/{created.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Empty(await deleteResponse.Content.ReadAsByteArrayAsync());

        var getResponse = await Client.GetAsync($"/api/tasks/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task UnknownId_ReturnsNotFoundForEveryItemEndpoint()
    {
        const int missingId = 999_999;

        var getResponse = await Client.GetAsync($"/api/tasks/{missingId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

        var putResponse = await Client.PutAsJsonAsync(
            $"/api/tasks/{missingId}",
            new UpdateTaskRequest
            {
                Title = "Missing",
                Status = TaskItemStatus.Pending,
                Priority = TaskPriority.Low
            },
            JsonOptions);
        Assert.Equal(HttpStatusCode.NotFound, putResponse.StatusCode);

        var patchResponse = await Client.PatchAsJsonAsync(
            $"/api/tasks/{missingId}/status",
            new UpdateTaskStatusRequest { Status = TaskItemStatus.Completed },
            JsonOptions);
        Assert.Equal(HttpStatusCode.NotFound, patchResponse.StatusCode);

        var deleteResponse = await Client.DeleteAsync($"/api/tasks/{missingId}");
        Assert.Equal(HttpStatusCode.NotFound, deleteResponse.StatusCode);
    }
}
