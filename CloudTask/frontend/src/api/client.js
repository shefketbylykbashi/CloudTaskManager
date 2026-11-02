import axios from "axios";

const DEFAULT_API_BASE_URL = "https://localhost:7011";
const REQUEST_TIMEOUT_MS = 15_000;

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? null;
    this.title = options.title ?? null;
    this.detail = options.detail ?? null;
    this.validationErrors = options.validationErrors ?? {};
    this.traceId = options.traceId ?? null;
    this.code = options.code ?? null;
  }
}

function normalizeValidationErrors(errors) {
  if (!errors || typeof errors !== "object") return {};

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  );
}

function firstValidationMessage(validationErrors) {
  return Object.values(validationErrors).flat().find(Boolean);
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.code === "ECONNABORTED") {
    return new ApiError(
      "The request took too long. Please check the API and try again.",
      { code: error.code },
    );
  }

  if (!error?.response) {
    return new ApiError(
      "CloudTask could not reach the API. Make sure the backend is running and its HTTPS certificate is trusted.",
      { code: error?.code ?? "NETWORK_ERROR" },
    );
  }

  const { status, data } = error.response;
  const problem = data && typeof data === "object" ? data : {};
  const validationErrors = normalizeValidationErrors(problem.errors);
  const validationMessage = firstValidationMessage(validationErrors);
  const fallbackByStatus = {
    400: "The submitted information is not valid.",
    404: "The requested task could not be found.",
    500: "The API encountered an unexpected error. Please try again.",
    502: "The API is temporarily unavailable. Please try again.",
    503: "The API is temporarily unavailable. Please try again.",
  };
  const message =
    validationMessage ||
    problem.detail ||
    problem.title ||
    fallbackByStatus[status] ||
    `The request failed (${status}).`;

  return new ApiError(message, {
    status,
    title: problem.title,
    detail: problem.detail,
    validationErrors,
    traceId: problem.traceId,
    code: error.code,
  });
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function isRequestCanceled(error) {
  return axios.isCancel(error) || error?.code === "ERR_CANCELED";
}

export default client;
