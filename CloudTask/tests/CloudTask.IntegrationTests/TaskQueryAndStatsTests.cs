using System.Net;
using System.Net.Http.Json;
using CloudTask.DTOs;
using CloudTask.IntegrationTests.Infrastructure;
using CloudTask.Models;

namespace CloudTask.IntegrationTests;

public sealed class TaskQueryAndStatsTests : IntegrationTestBase
{
    [Fact]
    public async Task GetAll_AppliesDefaultSortAndCombinedFilteringSearchSortingAndPagination()
    {
        var tasks = new[]
        {
            ("Alpha Azure", "First", TaskItemStatus.Pending, TaskPriority.High),
            ("Bravo Work", "AZURE appears in this description", TaskItemStatus.Pending, TaskPriority.High),
            ("Zulu Azure", "Third", TaskItemStatus.Pending, TaskPriority.High),
            ("Other Completed", "Azure", TaskItemStatus.Completed, TaskPriority.High),
            ("Azure Low", "Fifth", TaskItemStatus.Pending, TaskPriority.Low)
        };

        for (var index = 0; index < tasks.Length; index++)
        {
            Factory.Clock.SetUtcNow(CloudTaskApiFactory.DefaultUtcNow.AddMinutes(index));
            var task = tasks[index];
            await CreateTaskAsync(task.Item1, task.Item3, task.Item4, task.Item2);
        }

        var defaultPage = await Client.GetFromJsonAsync<PaginatedResponse<TaskResponse>>(
            "/api/tasks?page=1&pageSize=5",
            JsonOptions);

        Assert.NotNull(defaultPage);
        Assert.Equal(5, defaultPage.TotalCount);
        Assert.Equal(
            new[] { "Azure Low", "Other Completed", "Zulu Azure", "Bravo Work", "Alpha Azure" },
            defaultPage.Items.Select(item => item.Title));

        var firstPage = await Client.GetFromJsonAsync<PaginatedResponse<TaskResponse>>(
            "/api/tasks?status=Pending&priority=High&search=aZuRe&sortBy=title&sortDirection=asc&page=1&pageSize=2",
            JsonOptions);

        Assert.NotNull(firstPage);
        Assert.Equal(3, firstPage.TotalCount);
        Assert.Equal(1, firstPage.Page);
        Assert.Equal(2, firstPage.PageSize);
        Assert.Equal(2, firstPage.TotalPages);
        Assert.Equal(new[] { "Alpha Azure", "Bravo Work" }, firstPage.Items.Select(item => item.Title));
        Assert.All(firstPage.Items, item =>
        {
            Assert.Equal(TaskItemStatus.Pending, item.Status);
            Assert.Equal(TaskPriority.High, item.Priority);
        });

        var secondPage = await Client.GetFromJsonAsync<PaginatedResponse<TaskResponse>>(
            "/api/tasks?status=Pending&priority=High&search=aZuRe&sortBy=title&sortDirection=asc&page=2&pageSize=2",
            JsonOptions);

        Assert.NotNull(secondPage);
        Assert.Equal(3, secondPage.TotalCount);
        Assert.Equal(2, secondPage.Page);
        Assert.Single(secondPage.Items);
        Assert.Equal("Zulu Azure", secondPage.Items.Single().Title);
    }

    [Fact]
    public async Task Stats_ReturnZeroesWhenEmptyThenCalculateStatusesOverdueAndRate()
    {
        var emptyResponse = await Client.GetAsync("/api/tasks/stats");
        Assert.Equal(HttpStatusCode.OK, emptyResponse.StatusCode);
        var emptyStats = await emptyResponse.Content.ReadFromJsonAsync<TaskStatsResponse>(JsonOptions);
        Assert.NotNull(emptyStats);
        Assert.Equal(0, emptyStats.TotalTasks);
        Assert.Equal(0m, emptyStats.CompletionRate);

        var now = CloudTaskApiFactory.DefaultUtcNow;
        await CreateTaskAsync(
            "Pending overdue",
            TaskItemStatus.Pending,
            TaskPriority.High,
            dueDate: now.AddDays(-2));
        await CreateTaskAsync(
            "In progress overdue",
            TaskItemStatus.InProgress,
            TaskPriority.Medium,
            dueDate: now.AddMinutes(-1));
        await CreateTaskAsync(
            "Completed in the past",
            TaskItemStatus.Completed,
            TaskPriority.Low,
            dueDate: now.AddDays(-10));

        var response = await Client.GetAsync("/api/tasks/stats");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var stats = await response.Content.ReadFromJsonAsync<TaskStatsResponse>(JsonOptions);
        Assert.NotNull(stats);
        Assert.Equal(3, stats.TotalTasks);
        Assert.Equal(1, stats.PendingTasks);
        Assert.Equal(1, stats.InProgressTasks);
        Assert.Equal(1, stats.CompletedTasks);
        Assert.Equal(2, stats.OverdueTasks);
        Assert.Equal(33.33m, stats.CompletionRate);
    }
}
