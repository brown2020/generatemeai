/**
 * Client-side helpers for calling the app's API routes.
 * Every API endpoint returns the same ApiEnvelope<T> shape, so callers get
 * type-safe success/error discrimination without having to inspect HTTP
 * status codes directly.
 */

import type { ActionResult } from "@/utils/errors";

interface RequestOptions {
  /** AbortSignal to cancel the request. */
  signal?: AbortSignal;
  /** Override Content-Type (defaults to application/json unless body is FormData). */
  headers?: HeadersInit;
}

/**
 * Performs a fetch against an internal API route and unwraps the envelope.
 * Converts network/parse failures into ActionResult errors so every caller
 * can handle one shape.
 */
export async function apiFetch<T>(
  url: string,
  init: RequestInit & RequestOptions = {}
): Promise<ActionResult<T>> {
  try {
    const isFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;

    const response = await fetch(url, {
      credentials: "same-origin",
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return {
        success: false,
        error: `Unexpected response (${response.status} ${response.statusText})`,
        code: "GENERATION_FAILED",
      };
    }

    const body = (await response.json()) as ActionResult<T>;
    return body;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    return { success: false, error: message, code: "NETWORK_ERROR" };
  }
}

/**
 * POST helper — serializes a plain object as JSON.
 */
export function apiPost<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ActionResult<T>> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  });
}

/**
 * POST helper for multipart uploads (image generation with reference image).
 */
export function apiPostForm<T>(
  url: string,
  formData: FormData,
  options?: RequestOptions
): Promise<ActionResult<T>> {
  return apiFetch<T>(url, {
    method: "POST",
    body: formData,
    ...options,
  });
}

export function apiGet<T>(
  url: string,
  options?: RequestOptions
): Promise<ActionResult<T>> {
  return apiFetch<T>(url, { method: "GET", ...options });
}

export function apiPatch<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ActionResult<T>> {
  return apiFetch<T>(url, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  });
}

export function apiDelete<T>(
  url: string,
  options?: RequestOptions
): Promise<ActionResult<T>> {
  return apiFetch<T>(url, { method: "DELETE", ...options });
}
