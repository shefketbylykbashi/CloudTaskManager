export const TASK_STATUSES = ["Pending", "InProgress", "Completed"];
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

export const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In progress" },
  { value: "Completed", label: "Completed" },
];

export const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map(({ value, label }) => [value, label]),
);

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITY_OPTIONS.map(({ value, label }) => [value, label]),
);

export const STATUS_COLORS = {
  Pending: "#f59e0b",
  InProgress: "#6366f1",
  Completed: "#10b981",
};

export const PRIORITY_COLORS = {
  Low: "#38bdf8",
  Medium: "#8b5cf6",
  High: "#f43f5e",
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DEFAULT_TASK_QUERY = {
  search: "",
  status: "",
  priority: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  page: 1,
  pageSize: 20,
};

export const TASKS_CHANGED_EVENT = "cloudtask:tasks-changed";
