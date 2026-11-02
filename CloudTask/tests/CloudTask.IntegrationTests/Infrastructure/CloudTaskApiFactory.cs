using System.Data.Common;
using CloudTask.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace CloudTask.IntegrationTests.Infrastructure;

internal sealed class CloudTaskApiFactory : WebApplicationFactory<Program>
{
    private const string PlaceholderConnectionString =
        "Server=unused;Database=CloudTaskTests;User ID=unused;Password=unused;" +
        "Encrypt=True;TrustServerCertificate=False";

    public static readonly DateTimeOffset DefaultUtcNow =
        new(2026, 11, 2, 12, 0, 0, TimeSpan.Zero);

    public MutableTimeProvider Clock { get; } = new(DefaultUtcNow);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", PlaceholderConnectionString);

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = PlaceholderConnectionString,
                ["SeedData:Enabled"] = "false",
                ["Cors:AllowedOrigins:0"] = "http://localhost:3000",
                ["Cors:AllowedOrigins:1"] = "http://localhost:5173"
            });
        });

        builder.ConfigureTestServices(services =>
        {
            // EF Core 8 stores AddDbContext's provider configuration in these
            // options registrations. Removing both prevents the production
            // SQL Server options action from being composed with SQLite.
            services.RemoveAll<DbContextOptions<CloudTaskDbContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<CloudTaskDbContext>();
            services.RemoveAll<DbConnection>();

            services.AddSingleton<DbConnection>(_ =>
            {
                var connection = new SqliteConnection("Data Source=:memory:");
                connection.Open();
                return connection;
            });

            services.AddDbContext<CloudTaskDbContext>((serviceProvider, options) =>
            {
                var connection = serviceProvider.GetRequiredService<DbConnection>();
                options.UseSqlite(connection);
            });

            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(Clock);
        });
    }

    public async Task EnsureDatabaseCreatedAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CloudTaskDbContext>();

        if (!string.Equals(
                dbContext.Database.ProviderName,
                "Microsoft.EntityFrameworkCore.Sqlite",
                StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Expected the SQLite test provider, but resolved '{dbContext.Database.ProviderName}'.");
        }

        await dbContext.Database.EnsureCreatedAsync();
    }
}
