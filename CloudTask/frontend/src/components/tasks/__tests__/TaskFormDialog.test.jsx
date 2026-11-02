import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskFormDialog from "../TaskFormDialog";
import { toDateTimeLocalValue } from "../../../utils/date";

const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../../../api/tasksApi", () => ({
  createTask: mocks.createTask,
  updateTask: mocks.updateTask,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("TaskFormDialog", () => {
  beforeEach(() => {
    mocks.createTask.mockReset();
    mocks.updateTask.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it("shows required-title validation without calling the API", async () => {
    const user = userEvent.setup();
    render(<TaskFormDialog open onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A task title is required.",
    );
    expect(mocks.createTask).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("submits a trimmed create payload with canonical enum names and UTC due date", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const savedTask = {
      id: 7,
      title: "Ship dashboard",
      description: "Polish the analytics",
      status: "InProgress",
      priority: "High",
      dueDate: "2026-11-15T14:30:00.000Z",
    };
    mocks.createTask.mockResolvedValue(savedTask);

    render(<TaskFormDialog open onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "  Ship dashboard  " },
    });
    fireEvent.change(screen.getByLabelText(/^description$/i), {
      target: { value: "  Polish the analytics  " },
    });
    await user.selectOptions(screen.getByLabelText(/^status$/i), "InProgress");
    await user.selectOptions(screen.getByLabelText(/^priority$/i), "High");
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2026-11-15T14:30" },
    });

    await user.click(screen.getByRole("button", { name: "Create task" }));

    const expectedDueDate = new Date(2026, 10, 15, 14, 30, 0).toISOString();
    await waitFor(() => {
      expect(mocks.createTask).toHaveBeenCalledWith({
        title: "Ship dashboard",
        description: "Polish the analytics",
        status: "InProgress",
        priority: "High",
        dueDate: expectedDueDate,
      });
    });
    expect(onSaved).toHaveBeenCalledWith(savedTask);
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Task created",
      expect.objectContaining({ description: expect.stringContaining("Ship dashboard") }),
    );
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("prefills an edit form and sends the complete updated payload", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const task = {
      id: 19,
      title: "Original title",
      description: "Original description",
      status: "Pending",
      priority: "Low",
      dueDate: "2026-11-15T12:00:00.000Z",
    };
    const savedTask = {
      ...task,
      title: "Updated title",
      description: "Updated description",
      status: "InProgress",
      priority: "High",
      dueDate: "2026-11-20T08:45:00.000Z",
    };
    mocks.updateTask.mockResolvedValue(savedTask);

    render(
      <TaskFormDialog
        open
        task={task}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByLabelText(/task title/i)).toHaveValue("Original title");
    expect(screen.getByLabelText(/^description$/i)).toHaveValue(
      "Original description",
    );
    expect(screen.getByLabelText(/^status$/i)).toHaveValue("Pending");
    expect(screen.getByLabelText(/^priority$/i)).toHaveValue("Low");
    expect(screen.getByLabelText(/due date/i)).toHaveValue(
      toDateTimeLocalValue(task.dueDate),
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "  Updated title  " },
    });
    fireEvent.change(screen.getByLabelText(/^description$/i), {
      target: { value: "  Updated description  " },
    });
    await user.selectOptions(screen.getByLabelText(/^status$/i), "InProgress");
    await user.selectOptions(screen.getByLabelText(/^priority$/i), "High");
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2026-11-20T08:45" },
    });
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const expectedDueDate = new Date(2026, 10, 20, 8, 45, 0).toISOString();
    await waitFor(() => {
      expect(mocks.updateTask).toHaveBeenCalledWith(19, {
        title: "Updated title",
        description: "Updated description",
        status: "InProgress",
        priority: "High",
        dueDate: expectedDueDate,
      });
    });
    expect(mocks.createTask).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith(savedTask);
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Task updated",
      expect.objectContaining({ description: expect.stringContaining("Updated title") }),
    );
  });

  it("maps camelCase and JSON-path validation errors back to form fields", async () => {
    const user = userEvent.setup();
    const requestError = {
      message: "The submitted information is not valid.",
      validationErrors: {
        title: ["The server rejected this title."],
        "$.status": ["Choose a supported status."],
      },
    };
    mocks.createTask.mockRejectedValue(requestError);

    render(<TaskFormDialog open onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Valid client title" },
    });
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(
      await screen.findByText("The server rejected this title."),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose a supported status.")).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/^status$/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Could not create the task",
      { description: requestError.message },
    );
  });
});

