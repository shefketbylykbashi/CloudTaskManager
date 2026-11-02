import client from "./client";
import { TASKS_CHANGED_EVENT } from "../utils/taskConstants";

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

function announceTaskChange(detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TASKS_CHANGED_EVENT, { detail }));
  }
}

export async function getTasks(params = {}, options = {}) {
  const response = await client.get("/api/tasks", {
    params: compactParams(params),
    signal: options.signal,
  });
  return response.data;
}

export async function getTask(id, options = {}) {
  const response = await client.get(`/api/tasks/${id}`, {
    signal: options.signal,
  });
  return response.data;
}

export async function createTask(payload, options = {}) {
  const response = await client.post("/api/tasks", payload, {
    signal: options.signal,
  });
  announceTaskChange({ action: "created", task: response.data });
  return response.data;
}

export async function updateTask(id, payload, options = {}) {
  const response = await client.put(`/api/tasks/${id}`, payload, {
    signal: options.signal,
  });
  announceTaskChange({ action: "updated", task: response.data });
  return response.data;
}

export async function updateTaskStatus(id, status, options = {}) {
  const response = await client.patch(
    `/api/tasks/${id}/status`,
    { status },
    { signal: options.signal },
  );
  announceTaskChange({ action: "status-updated", task: response.data });
  return response.data;
}

export async function deleteTask(id, options = {}) {
  await client.delete(`/api/tasks/${id}`, { signal: options.signal });
  announceTaskChange({ action: "deleted", id });
}

export async function getTaskStats(options = {}) {
  const response = await client.get("/api/tasks/stats", {
    signal: options.signal,
  });
  return response.data;
}

/**
 * Fetches the complete filtered task collection without exceeding the API's
 * page-size limit. Remaining pages are requested in small batches so a large
 * database does not create an unbounded burst of concurrent requests.
 */
export async function getAllTasks(params = {}, options = {}) {
  const pageSize = Math.min(Math.max(Number(params.pageSize) || 100, 1), 100);
  const query = {
    ...params,
    page: 1,
    pageSize,
    sortBy: params.sortBy || "createdAt",
    sortDirection: params.sortDirection || "desc",
  };
  const firstPage = await getTasks(query, options);
  const allTasks = [...firstPage.items];
  const batchSize = 5;

  for (let start = 2; start <= firstPage.totalPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, firstPage.totalPages);
    const requests = [];

    for (let page = start; page <= end; page += 1) {
      requests.push(getTasks({ ...query, page }, options));
    }

    const pages = await Promise.all(requests);
    pages.forEach((page) => allTasks.push(...page.items));
  }

  return allTasks;
}

const tasksApi = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getAllTasks,
};

export default tasksApi;
