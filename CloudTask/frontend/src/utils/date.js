const DEFAULT_LOCALE = undefined;

function asValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = asValidDate(value);
  if (!date) return "No due date";

  const { locale = DEFAULT_LOCALE, ...formatOptions } = options;

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...formatOptions,
  }).format(date);
}

export function formatDateTime(value, options = {}) {
  const date = asValidDate(value);
  if (!date) return "—";

  const { locale = DEFAULT_LOCALE, ...formatOptions } = options;

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...formatOptions,
  }).format(date);
}

export function toDateTimeLocalValue(value) {
  const date = asValidDate(value);
  if (!date) return "";

  const pad = (part) => String(part).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

/** Converts a browser datetime-local value from the user's local zone to UTC. */
export function localDateTimeToUtc(value) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const fromDateTimeLocalValue = localDateTimeToUtc;

export function isOverdue(taskOrDate, now = new Date()) {
  const isTask =
    taskOrDate && typeof taskOrDate === "object" && !(taskOrDate instanceof Date);
  if (isTask && taskOrDate.status === "Completed") return false;

  const date = asValidDate(isTask ? taskOrDate.dueDate : taskOrDate);
  const comparisonDate = asValidDate(now);
  return Boolean(date && comparisonDate && date < comparisonDate);
}

export function getDueDateLabel(taskOrDate, now = new Date()) {
  const isTask =
    taskOrDate && typeof taskOrDate === "object" && !(taskOrDate instanceof Date);
  const value = isTask ? taskOrDate.dueDate : taskOrDate;
  const date = asValidDate(value);
  const current = asValidDate(now);
  if (!date || !current) return "No due date";
  if (isTask && taskOrDate.status === "Completed") return "Completed";

  const startOfToday = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  );
  const startOfDueDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDifference = Math.round(
    (startOfDueDate - startOfToday) / (24 * 60 * 60 * 1000),
  );

  if (dayDifference === 0) return "Due today";
  if (dayDifference === 1) return "Due tomorrow";
  if (dayDifference === -1) return "1 day overdue";
  if (dayDifference < 0) return `${Math.abs(dayDifference)} days overdue`;
  if (dayDifference <= 7) return `Due in ${dayDifference} days`;
  return formatDate(date);
}
