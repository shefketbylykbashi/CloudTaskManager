import { describe, expect, it } from "vitest";
import { ApiError, normalizeApiError } from "../client";

describe("normalizeApiError", () => {
  it("normalizes validation Problem Details and prioritizes its first field message", () => {
    const normalized = normalizeApiError({
      code: "ERR_BAD_REQUEST",
      response: {
        status: 400,
        data: {
          title: "One or more validation errors occurred.",
          detail: "The request is invalid.",
          traceId: "trace-123",
          errors: {
            Title: ["A task title is required."],
            Priority: "Priority is required.",
          },
        },
      },
    });

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized.message).toBe("A task title is required.");
    expect(normalized.status).toBe(400);
    expect(normalized.validationErrors).toEqual({
      Title: ["A task title is required."],
      Priority: ["Priority is required."],
    });
    expect(normalized.traceId).toBe("trace-123");
  });

  it("uses Problem Details detail for item errors", () => {
    const normalized = normalizeApiError({
      response: {
        status: 404,
        data: {
          title: "Task not found",
          detail: "No task with ID 42 exists.",
        },
      },
    });

    expect(normalized.message).toBe("No task with ID 42 exists.");
    expect(normalized.status).toBe(404);
    expect(normalized.title).toBe("Task not found");
  });

  it("returns a friendly timeout error", () => {
    const normalized = normalizeApiError({ code: "ECONNABORTED" });

    expect(normalized.message).toMatch(/request took too long/i);
    expect(normalized.code).toBe("ECONNABORTED");
    expect(normalized.status).toBeNull();
  });

  it("returns a friendly network error when no response is available", () => {
    const normalized = normalizeApiError({ code: "ERR_NETWORK" });

    expect(normalized.message).toMatch(/could not reach the API/i);
    expect(normalized.message).toMatch(/HTTPS certificate is trusted/i);
    expect(normalized.code).toBe("ERR_NETWORK");
  });
});

