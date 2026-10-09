/**
 * File: src/services/apiClient.ts
 *
 * Purpose:
 * Centralized HTTP client utilizing native browser/Next.js fetch for REST communication.
 *
 * Responsibilities:
 * - Configure base API endpoint from process.env.NEXT_PUBLIC_API_BASE_URL (production) with fallback to http://127.0.0.1:8000/api/v1 (local development).
 * - Normalize base URL by removing any trailing slashes to guarantee clean endpoint concatenation.
 * - Provide type-safe wrappers for GET, POST, PUT, PATCH, and DELETE requests.
 * - Append default headers (Content-Type: application/json, Accept: application/json).
 * - Standardize error handling and HTTP response unpacking across 2xx, 4xx, 5xx, and network errors.
 *
 * This file does NOT:
 * - Hard-code deployment URLs into individual service modules.
 * - Contain domain-specific API endpoint logic.
 * - Store application or session state.
 * - Render UI or error toasts directly.
 */

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api/v1';

// Strip any trailing slash to prevent double-slash path concatenation issues (e.g. /api/v1//meetings)
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');


export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 8000, headers, ...rest } = options;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      let errorData: unknown;
      let errorMessage = `Request failed (${response.status})`;

      try {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
          const detail = (errorData as { detail: unknown }).detail;
          errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
        }
      } catch {
        try {
          errorData = await response.text();
          if (typeof errorData === 'string' && errorData.trim()) {
            errorMessage = errorData;
          }
        } catch {
          // ignore parsing error
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network connection failure';
    throw new ApiError(`Unable to connect to server: ${message}`, 0, err);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
