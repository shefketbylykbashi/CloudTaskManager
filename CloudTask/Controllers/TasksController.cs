using CloudTask.DTOs;
using CloudTask.Services;
using Microsoft.AspNetCore.Mvc;

namespace CloudTask.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        /// <summary>Creates a task.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TaskResponse>> Create(
            [FromBody] CreateTaskRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = await _taskService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = taskItem.Id }, taskItem);
        }

        /// <summary>Returns a filtered, sorted, and paginated task list.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<TaskResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PaginatedResponse<TaskResponse>>> GetAll(
            [FromQuery] TaskQueryParameters queryParameters,
            CancellationToken cancellationToken)
        {
            var response = await _taskService.GetAsync(queryParameters, cancellationToken);
            return Ok(response);
        }

        /// <summary>Returns dashboard statistics calculated from persisted tasks.</summary>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(TaskStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TaskStatsResponse>> GetStats(
            CancellationToken cancellationToken)
        {
            var response = await _taskService.GetStatsAsync(cancellationToken);
            return Ok(response);
        }

        /// <summary>Returns one task by its identifier.</summary>
        [HttpGet("{id:int}", Name = nameof(GetById))]
        [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TaskResponse>> GetById(
            int id,
            CancellationToken cancellationToken)
        {
            var taskItem = await _taskService.GetByIdAsync(id, cancellationToken);
            return taskItem is null ? TaskNotFound(id) : Ok(taskItem);
        }

        /// <summary>Replaces the editable fields of an existing task.</summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TaskResponse>> Update(
            int id,
            [FromBody] UpdateTaskRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = await _taskService.UpdateAsync(id, request, cancellationToken);
            return taskItem is null ? TaskNotFound(id) : Ok(taskItem);
        }

        /// <summary>Changes only a task's status.</summary>
        [HttpPatch("{id:int}/status")]
        [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TaskResponse>> UpdateStatus(
            int id,
            [FromBody] UpdateTaskStatusRequest request,
            CancellationToken cancellationToken)
        {
            var taskItem = await _taskService.UpdateStatusAsync(id, request, cancellationToken);
            return taskItem is null ? TaskNotFound(id) : Ok(taskItem);
        }

        /// <summary>Permanently deletes a task.</summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(
            int id,
            CancellationToken cancellationToken)
        {
            var deleted = await _taskService.DeleteAsync(id, cancellationToken);
            return deleted ? NoContent() : TaskNotFound(id);
        }

        private ObjectResult TaskNotFound(int id)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Task not found",
                detail: $"No task with ID {id} exists.",
                type: "https://httpstatuses.com/404");
        }
    }
}
