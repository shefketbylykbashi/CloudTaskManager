import { describe, expect, it } from "vitest";
import {
  getDueDateLabel,
  isOverdue,
  localDateTimeToUtc,
} from "../date";

describe("date helpers", () => {
  it("converts a browser-local datetime value to the matching UTC instant", () => {
    const localValue = "2026-11-15T14:30";
    const expectedUtc = new Date(2026, 10, 15, 14, 30, 0).toISOString();

    expect(localDateTimeToUtc(localValue)).toBe(expectedUtc);
  });

  it("returns null for empty or malformed datetime-local values", () => {
    expect(localDateTimeToUtc("")).toBeNull();
    expect(localDateTimeToUtc("2026-11-15 14:30")).toBeNull();
  });

  it("only marks unfinished tasks with past due dates as overdue", () => {
    const now = new Date("2026-11-02T12:00:00.000Z");
    const overdueDate = "2026-11-01T12:00:00.000Z";

    expect(isOverdue({ status: "Pending", dueDate: overdueDate }, now)).toBe(true);
    expect(isOverdue({ status: "InProgress", dueDate: overdueDate }, now)).toBe(true);
    expect(isOverdue({ status: "Completed", dueDate: overdueDate }, now)).toBe(false);
    expect(
      isOverdue({ status: "Pending", dueDate: "2026-11-03T12:00:00.000Z" }, now),
    ).toBe(false);
    expect(isOverdue({ status: "Pending", dueDate: null }, now)).toBe(false);
  });

  it("creates clear relative due-date labels", () => {
    const now = new Date(2026, 10, 2, 12, 0, 0);

    expect(getDueDateLabel(new Date(2026, 10, 2, 20, 0, 0), now)).toBe("Due today");
    expect(getDueDateLabel(new Date(2026, 10, 3, 8, 0, 0), now)).toBe("Due tomorrow");
    expect(getDueDateLabel(new Date(2026, 10, 1, 8, 0, 0), now)).toBe("1 day overdue");
    expect(getDueDateLabel(new Date(2026, 9, 30, 8, 0, 0), now)).toBe("3 days overdue");
    expect(
      getDueDateLabel(
        { status: "Completed", dueDate: new Date(2026, 9, 30, 8, 0, 0) },
        now,
      ),
    ).toBe("Completed");
  });
});

