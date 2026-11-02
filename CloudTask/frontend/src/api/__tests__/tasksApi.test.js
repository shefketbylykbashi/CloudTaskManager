import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
  updateTaskStatus,
} from "../tasksApi";
import { TASKS_CHANGED_EVENT } from "../../utils/taskConstants";

const mocks = vi.hoisted(() => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../client", () => ({ default: mocks.client }));

describe("tasksApi", () => {
  beforeEach(() => {
    Object.values(mocks.client).forEach((method) => method.mockReset());
  });

  it("aggregates every server page with clamped page size and consistent query options", async () => {
    const signal = new AbortController().signal;
    const requestedPages = [];

    mocks.client.get.mockImplementation(async (url, config) => {
      requestedPages.push(config.params.page);
      const page = config.params.page;
      return {
        data: {
          items: [{ id: page, title: `Task ${page}` }],
          totalCount: 7,
          page,
          pageSize: 100,
          totalPages: 7,
        },
      };
    });

    const tasks = await getAllTasks(
      {
        search: "azure",
        status: "",
        pageSize: 500,
        sortBy: "title",
        sortDirection: "asc",
      },
      { signal },
    );

    expect(tasks.map((task) => task.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(requestedPages).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(mocks.client.get).toHaveBeenCalledTimes(7);

    mocks.client.get.mock.calls.forEach(([url, config], index) => {
      expect(url).toBe("/api/tasks");
      expect(config).toEqual({
        params: {
          search: "azure",
          pageSize: 100,
          sortBy: "title",
          sortDirection: "asc",
          page: index + 1,
        },
        signal,
      });
    });
  });

  it("announces successful mutations with canonical event details", async () => {
    const created = { id: 1, title: "Created", status: "Pending" };
    const updated = { ...created, title: "Updated", status: "InProgress" };
    const completed = { ...updated, status: "Completed" };
    const receivedDetails = [];
    const handleChange = (event) => receivedDetails.push(event.detail);
    window.addEventListener(TASKS_CHANGED_EVENT, handleChange);

    mocks.client.post.mockResolvedValue({ data: created });
    mocks.client.put.mockResolvedValue({ data: updated });
    mocks.client.patch.mockResolvedValue({ data: completed });
    mocks.client.delete.mockResolvedValue({});

    try {
      await expect(createTask({ title: "Created" })).resolves.toEqual(created);
      await expect(updateTask(1, { title: "Updated" })).resolves.toEqual(updated);
      await expect(updateTaskStatus(1, "Completed")).resolves.toEqual(completed);
      await expect(deleteTask(1)).resolves.toBeUndefined();
    } finally {
      window.removeEventListener(TASKS_CHANGED_EVENT, handleChange);
    }

    expect(receivedDetails).toEqual([
      { action: "created", task: created },
      { action: "updated", task: updated },
      { action: "status-updated", task: completed },
      { action: "deleted", id: 1 },
    ]);
    expect(mocks.client.post).toHaveBeenCalledWith(
      "/api/tasks",
      { title: "Created" },
      { signal: undefined },
    );
    expect(mocks.client.put).toHaveBeenCalledWith(
      "/api/tasks/1",
      { title: "Updated" },
      { signal: undefined },
    );
    expect(mocks.client.patch).toHaveBeenCalledWith(
      "/api/tasks/1/status",
      { status: "Completed" },
      { signal: undefined },
    );
    expect(mocks.client.delete).toHaveBeenCalledWith("/api/tasks/1", {
      signal: undefined,
    });
  });
});

