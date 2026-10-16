import { getAuthToken, clearStoredSession } from '@/lib/auth';
import { ApiErrorResponse } from '@/types/api';

const API_BASE_URL =
  (typeof window !== 'undefined' && (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__) ||
  (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '');

export class ApiError extends Error {
  statusCode: number;
  error: string;
  fieldErrors?: Record<string, string>;

  constructor(statusCode: number, error: string, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getAuthToken();
  const requestHeaders: Record<string, string> = {
    ...((headers as Record<string, string>) || {}),
  };

  if (token && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(customConfig.body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
    });

    if (response.status === 401) {
      // Clear session on 401 Unauthorized
      clearStoredSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        window.dispatchEvent(new CustomEvent('auth_unauthorized'));
      }
    }

    if (!response.ok) {
      let errorData: Partial<ApiErrorResponse> = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: response.statusText || 'An unexpected server error occurred',
          error: `HTTP_${response.status}`,
          statusCode: response.status,
        };
      }

      throw new ApiError(
        response.status,
        errorData.error || `HTTP_${response.status}`,
        errorData.message || `Request failed with status ${response.status}`,
        errorData.fieldErrors
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Handle blob / arrayBuffer / json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(0, 'NETWORK_ERROR', message);
  }
}
