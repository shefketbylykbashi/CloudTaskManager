using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CloudTask.DTOs;
using CloudTask.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CloudTask.IntegrationTests.Infrastructure;

public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

    private protected CloudTaskApiFactory Factory { get; } = new();

    protected HttpClient Client { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        Client = Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        await Factory.EnsureDatabaseCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        Client.Dispose();
        await Factory.DisposeAsync();
    }

    protected async Task<TaskResponse> CreateTaskAsync(
        string title,
        TaskItemStatus status = TaskItemStatus.Pending,
        TaskPriority priority = TaskPriority.Medium,
        string? description = null,
        DateTimeOffset? dueDate = null)
    {
        var request = new CreateTaskRequest
        {
            Title = title,
            Description = description,
            Status = status,
            Priority = priority,
            DueDate = dueDate
        };

        var response = await Client.PostAsJsonAsync("/api/tasks", request, JsonOptions);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var task = await response.Content.ReadFromJsonAsync<TaskResponse>(JsonOptions);
        return Assert.IsType<TaskResponse>(task);
    }

    protected static async Task AssertValidationProblemAsync(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(400, problem.RootElement.GetProperty("status").GetInt32());
        Assert.True(problem.RootElement.TryGetProperty("errors", out var errors));
        Assert.True(errors.EnumerateObject().Any());
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(
            namingPolicy: null,
            allowIntegerValues: false));
        return options;
    }
}
