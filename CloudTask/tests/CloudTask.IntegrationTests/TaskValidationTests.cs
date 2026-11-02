using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CloudTask.DTOs;
using CloudTask.IntegrationTests.Infrastructure;
using CloudTask.Models;

namespace CloudTask.IntegrationTests;

public sealed class TaskValidationTests : IntegrationTestBase
{
    public static IEnumerable<object[]> InvalidCreateBodies()
    {
        yield return new object[]
        {
            """
            { "status": "Pending", "priority": "High" }
            """
        };
        yield return new object[]
        {
            """
            { "title": "   ", "status": "Pending", "priority": "High" }
            """
        };
        yield return new object[]
        {
            JsonSerializer.Serialize(new
            {
                title = new string('x', 151),
                status = "Pending",
                priority = "High"
            })
        };
        yield return new object[]
        {
            JsonSerializer.Serialize(new
            {
                title = "Too much detail",
                description = new string('x', 2001),
                status = "Pending",
                priority = "High"
            })
        };
        yield return new object[]
        {
            """
            { "title": "Invalid enum", "status": "Blocked", "priority": "High" }
            """
        };
        yield return new object[]
        {
            """
            { "title": "Numeric enum", "status": 0, "priority": "High" }
            """
        };
        yield return new object[]
        {
            """
            { "title": "Malformed date", "status": "Pending", "priority": "High", "dueDate": "tomorrow" }
            """
        };
        yield return new object[]
        {
            """
            { "title": "Missing priority", "status": "Pending" }
            """
        };
    }

    public static IEnumerable<object[]> InvalidQueries()
    {
        yield return new object[] { "/api/tasks?page=0" };
        yield return new object[] { "/api/tasks?pageSize=101" };
        yield return new object[] { "/api/tasks?sortBy=notAField" };
        yield return new object[] { "/api/tasks?sortDirection=sideways" };
        yield return new object[] { "/api/tasks?status=Blocked" };
    }

    [Theory]
    [MemberData(nameof(InvalidCreateBodies))]
    public async Task Create_WithInvalidInput_ReturnsValidationProblem(string json)
    {
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await Client.PostAsync("/api/tasks", content);

        await AssertValidationProblemAsync(response);
    }

    [Theory]
    [MemberData(nameof(InvalidQueries))]
    public async Task GetAll_WithInvalidQuery_ReturnsValidationProblem(string uri)
    {
        var response = await Client.GetAsync(uri);

        await AssertValidationProblemAsync(response);
    }

    [Fact]
    public async Task UpdateAndPatch_WithInvalidInput_ReturnValidationProblems()
    {
        var created = await CreateTaskAsync("Valid task");

        var putResponse = await Client.PutAsJsonAsync(
            $"/api/tasks/{created.Id}",
            new
            {
                title = " ",
                status = "Pending",
                priority = "High"
            });
        await AssertValidationProblemAsync(putResponse);

        using var patchContent = new StringContent(
            """{ "status": 2 }""",
            Encoding.UTF8,
            "application/json");
        var patchResponse = await Client.PatchAsync(
            $"/api/tasks/{created.Id}/status",
            patchContent);
        await AssertValidationProblemAsync(patchResponse);
    }

    [Fact]
    public async Task Create_WithMalformedJson_ReturnsValidationProblem()
    {
        using var content = new StringContent(
            """{ "title": "Broken", "status": "Pending" "priority": "High" }""",
            Encoding.UTF8,
            "application/json");

        var response = await Client.PostAsync("/api/tasks", content);

        await AssertValidationProblemAsync(response);
    }
}
