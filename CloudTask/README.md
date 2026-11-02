# CloudTask Manager API

CloudTask Manager is a .NET 8 REST API for creating, organizing, and reporting on task items stored in Microsoft SQL Server or Azure SQL Database. It uses ASP.NET Core controllers, Entity Framework Core, asynchronous database access, DTO-based HTTP contracts, OpenAPI/Swagger, and Problem Details error responses.

The configured Azure resource is:

- Server: `cloudtask-sql-2026.database.windows.net`
- Database: `CloudTaskDb`
- Region: Poland Central
- Resource group: `rg-cloudtask`

Azure SQL connectivity has **not** been tested from this project environment. A valid SQL login, an Azure SQL firewall rule, and a securely supplied connection string are still required.

## Architecture

The API intentionally uses a small layered design. Controllers own HTTP behavior, `TaskService` owns application/query behavior, and `CloudTaskDbContext` owns persistence. There is no repository wrapper because Entity Framework Core already supplies the required unit-of-work and query abstractions.

| Path | Purpose |
| --- | --- |
| `Controllers/TasksController.cs` | Defines `/api/tasks` routes, status codes, and HTTP contracts. |
| `DTOs/` | Request, response, query, statistics, and pagination contracts. EF entities are never returned directly. |
| `Models/` | The `TaskItem` entity and the `TaskItemStatus`/`TaskPriority` enums. |
| `Data/CloudTaskDbContext.cs` | EF Core database context. |
| `Data/Configurations/TaskItemConfiguration.cs` | SQL column types, sizes, enum conversion, UTC conversion, checks, and indexes. |
| `Data/Seeding/DevelopmentDataSeeder.cs` | Optional, development-only, idempotent sample-data seeding. |
| `Services/ITaskService.cs` | Application service contract. |
| `Services/TaskService.cs` | CRUD, filtering, sorting, pagination, and statistics queries. |
| `Mapping/TaskMappings.cs` | Maps persisted entities to response DTOs. |
| `Migrations/` | Versioned EF Core schema migrations, including `InitialCreate`. |
| `Program.cs` | Dependency injection, SQL Server, JSON enums, CORS, Swagger, Problem Details, and request pipeline configuration. |
| `appsettings*.json` | Non-secret defaults for CORS, seeding, logging, and the empty connection-string slot. |
| `CloudTask.http` | Ready-to-edit example HTTP requests for every endpoint. |
| `tests/CloudTask.IntegrationTests/` | Automated API behavior tests that use a local SQLite database rather than Azure credentials. |

The SQL schema stores `Title` and `Description` as Unicode strings, stores enum names with database check constraints, and stores dates as UTC `datetime2` values. Read queries use `AsNoTracking`, and filtering, ordering, aggregation, and pagination run in the database.

## Prerequisites

- .NET 8 SDK
- Access to the existing Azure SQL server and database
- A SQL-authentication login with access to `CloudTaskDb`
- Network access to Azure SQL on TCP port 1433
- A trusted local ASP.NET Core HTTPS development certificate for the HTTPS launch profile

To trust the development certificate on Windows:

```powershell
dotnet dev-certs https --trust
```

Restore project packages and the repository-local EF Core CLI tool:

```powershell
dotnet restore
dotnet tool restore
```

The local tool manifest pins `dotnet-ef` to the same EF Core 8 patch used by the application, so use `dotnet tool restore` rather than relying on an unrelated global tool.

## Configure Azure SQL securely

The API reads `ConnectionStrings:DefaultConnection`. `appsettings.json` deliberately contains an empty value and must not receive a real password.

### Option 1: .NET User Secrets for local development

User Secrets are already initialized in `CloudTask.csproj`. From the project directory, replace the placeholders and run:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=tcp:cloudtask-sql-2026.database.windows.net,1433;Initial Catalog=CloudTaskDb;Persist Security Info=False;User ID=<sql-user>;Password=<sql-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

Confirm that the key exists without printing its secret value in logs or screenshots. User Secrets keep credentials outside the repository, but they are not an encrypted production secret store.

Treat terminal history and process arguments as sensitive. If local policy records them, enter the value through Visual Studio's Manage User Secrets UI or an approved secret-management workflow instead of pasting a populated connection string into a recorded command.

### Option 2: environment variable

ASP.NET Core maps double underscores to configuration separators. This PowerShell example sets the value only for the current terminal process and its children:

```powershell
$env:ConnectionStrings__DefaultConnection = 'Server=tcp:cloudtask-sql-2026.database.windows.net,1433;Initial Catalog=CloudTaskDb;Persist Security Info=False;User ID=<sql-user>;Password=<sql-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
```

For deployed environments, configure the same key through the hosting platform's secret/application-settings facility instead of committing it to a file. The application forcibly enables encryption and disables `TrustServerCertificate`, even if weaker values are supplied.

### Azure portal and database prerequisites

Before running migrations or the API:

1. In the Azure portal, open the SQL server `cloudtask-sql-2026`, then its **Networking** settings.
2. Permit the current client's public IP using the narrowest practical firewall rule. Do not broadly expose the server.
3. Confirm that public network access is enabled only if local access requires it. For private networking, run the API from a network with the required private DNS and routing.
4. Confirm the SQL-authentication username/password and that the login or contained database user can connect to `CloudTaskDb`.
5. Grant only the database permissions needed to run the application. Applying migrations additionally requires schema-alteration permissions; alternatively, have a database administrator review and execute the generated SQL script.
6. Confirm that outbound TCP 1433 is allowed and that the machine trusts the certificate chain used by Azure SQL.

The resource group and database already existing does not automatically grant the local machine network or login access.

## EF Core migrations

The application does **not** call `Database.Migrate()` and never applies schema changes at startup. Migration execution is an explicit operator action.

When relying on User Secrets, pass the Development environment to design-time commands so that the secrets provider is loaded:

```powershell
dotnet tool restore
dotnet ef migrations list -- --environment Development
```

Create a migration after a deliberate model change:

```powershell
dotnet ef migrations add DescriptiveMigrationName --output-dir Migrations -- --environment Development
```

Generate an idempotent SQL script for review or database-administrator deployment:

```powershell
dotnet ef migrations script --idempotent --output .\CloudTaskDb.sql -- --environment Development
```

After reviewing the target, credentials, migration, and generated SQL, explicitly update the configured database:

```powershell
dotnet ef database update -- --environment Development
```

If `ConnectionStrings__DefaultConnection` is set as an environment variable, it is available independently of User Secrets. Never put a password in a migration, generated script, or source-controlled settings file. Applying the current migration creates the `TaskItems` table, constraints, and indexes; it does not recreate or drop `CloudTaskDb`.

## Run locally

The launch profiles set the environment to `Development`, which enables Swagger:

```powershell
dotnet run --launch-profile https
```

Default local addresses are:

- API: `https://localhost:7011`
- Swagger UI: `https://localhost:7011/swagger`
- HTTP profile address: `http://localhost:5287` (requests are redirected to HTTPS)

Startup requires a non-empty `DefaultConnection`. A successful startup proves only that configuration could be parsed; the first database operation is what attempts an actual connection.

## Optional development seed data

Seeding is disabled by default. It runs only when both conditions are true:

- `ASPNETCORE_ENVIRONMENT` is `Development`.
- `SeedData:Enabled` is `true`.

The database schema must already be migrated. To enable seeding for one PowerShell session:

```powershell
$env:SeedData__Enabled = 'true'
dotnet run --launch-profile https
```

The seeder inserts 15 varied sample tasks only when `TaskItems` is empty. It does not overwrite or append to existing user data. Clear the environment variable or set it to `false` after seeding. Production environments are never seeded by this startup path.

## JSON and validation conventions

- JSON property names are camel-cased.
- Status values are `Pending`, `InProgress`, or `Completed`.
- Priority values are `Low`, `Medium`, or `High`.
- Enums must be sent as names; numeric enum values are rejected.
- Request dates use ISO 8601, preferably with `Z` or an explicit offset. They are normalized to UTC.
- `title` is required and limited to 150 characters.
- `description` is optional and limited to 2,000 characters.
- Invalid bodies and query parameters return HTTP 400 validation Problem Details.
- Missing task IDs return HTTP 404 Problem Details.
- Unexpected failures use Problem Details and include a trace identifier.

## Endpoints

| Method | Route | Success | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/tasks` | `201 Created` | Create a task and return it with a `Location` header. |
| `GET` | `/api/tasks` | `200 OK` | Filter, search, sort, and paginate tasks. |
| `GET` | `/api/tasks/{id}` | `200 OK` | Retrieve one task; returns 404 when absent. |
| `PUT` | `/api/tasks/{id}` | `200 OK` | Replace all editable fields; returns 404 when absent. |
| `PATCH` | `/api/tasks/{id}/status` | `200 OK` | Change only the status; returns 404 when absent. |
| `DELETE` | `/api/tasks/{id}` | `204 No Content` | Permanently delete a task; returns 404 when absent. |
| `GET` | `/api/tasks/stats` | `200 OK` | Return persisted dashboard aggregates. |

### Create a task

`POST /api/tasks`

```json
{
  "title": "Complete Azure SQL Project",
  "description": "Implement and test CRUD endpoints",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-11-15T12:00:00Z"
}
```

Example `201 Created` response:

```json
{
  "id": 1,
  "title": "Complete Azure SQL Project",
  "description": "Implement and test CRUD endpoints",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-11-15T12:00:00Z",
  "createdAt": "2026-11-02T09:30:00Z",
  "updatedAt": null
}
```

`description` and `dueDate` may be `null`. The server assigns `id` and `createdAt`.

### List tasks

`GET /api/tasks?status=Pending&priority=High&search=azure&sortBy=dueDate&sortDirection=asc&page=1&pageSize=10`

Supported query parameters:

| Parameter | Allowed values/default |
| --- | --- |
| `status` | `Pending`, `InProgress`, or `Completed`; optional. |
| `priority` | `Low`, `Medium`, or `High`; optional. |
| `search` | Case-insensitive title/description substring, maximum 200 characters; optional. |
| `sortBy` | `id`, `title`, `status`, `priority`, `dueDate`, `createdAt`, or `updatedAt`; defaults to `createdAt`. |
| `sortDirection` | `asc` or `desc`; defaults to `desc`. |
| `page` | 1 through 1,000,000; defaults to 1. |
| `pageSize` | 1 through 100; defaults to 20. |

Example response:

```json
{
  "items": [
    {
      "id": 1,
      "title": "Complete Azure SQL Project",
      "description": "Implement and test CRUD endpoints",
      "status": "Pending",
      "priority": "High",
      "dueDate": "2026-11-15T12:00:00Z",
      "createdAt": "2026-11-02T09:30:00Z",
      "updatedAt": null
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

The default ordering is newest `createdAt` first, with `id` as a deterministic tie-breaker. Pagination is performed by SQL Server rather than in memory.

### Retrieve one task

`GET /api/tasks/1`

Example `200 OK` response:

```json
{
  "id": 1,
  "title": "Complete Azure SQL Project",
  "description": "Implement and test CRUD endpoints",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-11-15T12:00:00Z",
  "createdAt": "2026-11-02T09:30:00Z",
  "updatedAt": null
}
```

A missing ID returns 404:

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Task not found",
  "status": 404,
  "detail": "No task with ID 999999 exists."
}
```

### Replace a task's editable fields

`PUT /api/tasks/1`

```json
{
  "title": "Complete Azure SQL Project",
  "description": "CRUD and documentation are ready for review",
  "status": "InProgress",
  "priority": "High",
  "dueDate": "2026-11-16T12:00:00Z"
}
```

All non-nullable editable fields are required. The server preserves `id` and `createdAt`, sets `updatedAt`, and returns the updated task:

```json
{
  "id": 1,
  "title": "Complete Azure SQL Project",
  "description": "CRUD and documentation are ready for review",
  "status": "InProgress",
  "priority": "High",
  "dueDate": "2026-11-16T12:00:00Z",
  "createdAt": "2026-11-02T09:30:00Z",
  "updatedAt": "2026-11-02T10:00:00Z"
}
```

### Change only the status

`PATCH /api/tasks/1/status`

```json
{
  "status": "Completed"
}
```

Example `200 OK` response:

```json
{
  "id": 1,
  "title": "Complete Azure SQL Project",
  "description": "CRUD and documentation are ready for review",
  "status": "Completed",
  "priority": "High",
  "dueDate": "2026-11-16T12:00:00Z",
  "createdAt": "2026-11-02T09:30:00Z",
  "updatedAt": "2026-11-02T10:05:00Z"
}
```

### Delete a task

`DELETE /api/tasks/1`

A successful permanent deletion returns `204 No Content` with no response body.

### Dashboard statistics

`GET /api/tasks/stats`

```json
{
  "totalTasks": 120,
  "pendingTasks": 35,
  "inProgressTasks": 45,
  "completedTasks": 40,
  "overdueTasks": 12,
  "completionRate": 33.33
}
```

An overdue task has a due date before the current UTC time and is not completed. `completionRate` is the completed count divided by the total count, expressed as a percentage and rounded to two decimals. An empty database returns zeros.

## Swagger and manual HTTP testing

Run the Development HTTPS profile and open `https://localhost:7011/swagger`. Swagger lists the request/response schemas and documented status codes, and **Try it out** can execute each operation. Create a task first, copy its returned ID, and use that ID for retrieve, update, status-change, and delete operations.

Alternatively, open `CloudTask.http` in Visual Studio, VS Code with a compatible REST client, or JetBrains Rider. Set `@TaskId` to an existing ID before running ID-specific requests. The file contains no credentials; the API itself owns database configuration.

## Frontend integration and CORS

The Development configuration allowlist permits these local frontend origins:

- `http://localhost:3000`
- `http://localhost:5173`

The base configuration uses an empty allowlist, so a deployed environment must explicitly configure every trusted origin through `Cors:AllowedOrigins` or equivalent `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, and subsequent environment-variable keys. Include the exact scheme, host, and port, without a trailing slash. Do not replace the allowlist with `AllowAnyOrigin`.

Example browser request:

```javascript
const response = await fetch(
  "https://localhost:7011/api/tasks?page=1&pageSize=20&sortBy=createdAt&sortDirection=desc",
  { headers: { Accept: "application/json" } }
);

if (!response.ok) {
  const problem = await response.json();
  throw new Error(problem.detail ?? problem.title ?? "CloudTask request failed");
}

const page = await response.json();
```

For `POST`, `PUT`, and `PATCH`, send `Content-Type: application/json` and serialize one of the documented bodies. For `DELETE`, do not attempt to parse JSON after a 204 response. A production frontend should use its configured API base URL rather than hard-coding localhost.

## Tests

The automated tests do not require live Azure credentials. From the project directory, run:

```powershell
dotnet test .\tests\CloudTask.IntegrationTests\CloudTask.IntegrationTests.csproj
```

The tests exercise application behavior through the API with an isolated local database, including CRUD, filtering/pagination, statistics, invalid input, and missing IDs.

## Manual completion checklist

1. Supply `DefaultConnection` through User Secrets or a secure environment setting.
2. Add the current client or deployment network to the Azure SQL firewall rules.
3. Confirm the SQL login has access to `CloudTaskDb` and appropriate least-privilege permissions.
4. Restore packages and the local EF tool.
5. Review the existing migration and generate an idempotent SQL script if required by the deployment process.
6. Explicitly apply the migration or have a database administrator execute the reviewed script.
7. Optionally enable development seeding only after the schema exists.
8. Run the automated tests.
9. Start the Development profile and verify the endpoints through Swagger or `CloudTask.http`.
10. Confirm and configure the frontend origin allowlist for each environment.
11. Perform and record a real Azure SQL connectivity check; it was not possible in the current project environment.
