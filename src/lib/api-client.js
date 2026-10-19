import { getAuthToken, clearStoredSession } from "@/lib/auth";
const API_BASE_URL =
  (typeof window !== "undefined" && window.__API_BASE_URL__) ||
  (process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "") : "");
export class ApiError extends Error {
  statusCode;
  error;
  fieldErrors;
  constructor(statusCode, error, message, fieldErrors) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
    this.fieldErrors = fieldErrors;
  }
}
export async function apiClient(endpoint, options = {}) {
  const { params, responseType, headers = {}, ...customConfig } = options;
  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }
  const token = getAuthToken();
  const requestHeaders = {
    ...headers || {}
  };
  if (token && !requestHeaders["Authorization"]) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }
  if (!(customConfig.body instanceof FormData) && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }
  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders
    });
    if (response.status === 401) {
      clearStoredSession();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/")) {
        window.dispatchEvent(new CustomEvent("auth_unauthorized"));
      }
    }
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: response.statusText || "An unexpected server error occurred",
          error: `HTTP_${response.status}`,
          statusCode: response.status
        };
      }
      throw new ApiError(
        response.status,
        errorData.error || `HTTP_${response.status}`,
        errorData.message || `Request failed with status ${response.status}`,
        errorData.fieldErrors
      );
    }
    if (response.status === 204) {
      return {};
    }
    if (responseType === "blob") {
      return await response.blob();
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new ApiError(0, "NETWORK_ERROR", message);
  }
}
