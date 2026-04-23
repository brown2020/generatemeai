/**
 * Server-only helpers for App Router Route Handlers.
 * Centralizes authentication, error-to-response mapping, and JSON helpers
 * so every route stays small and consistent.
 */

import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import {
  AppError,
  AuthenticationError,
  ValidationError,
  getErrorMessage,
  type ErrorCode,
} from "@/utils/errors";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Standard JSON response envelope. Matches the old ActionResult shape so
 * existing client code keeps working unchanged.
 */
export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json<ApiEnvelope<T>>({ success: true, data }, init);
}

export function jsonError(
  error: string,
  code?: ErrorCode,
  status: number = 400
): NextResponse<ApiEnvelope<never>> {
  return NextResponse.json<ApiEnvelope<never>>(
    { success: false, error, code },
    { status }
  );
}

/**
 * Maps an arbitrary thrown value to a JSON error response with the right
 * status code. Keeps route handlers free of boilerplate try/catch logic.
 */
export function errorToResponse(error: unknown): NextResponse<ApiEnvelope<never>> {
  if (error instanceof AuthenticationError) {
    return jsonError(error.message, "AUTHENTICATION_REQUIRED", 401);
  }
  if (error instanceof ValidationError) {
    return jsonError(error.message, "VALIDATION_ERROR", 400);
  }
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return jsonError(first?.message || "Validation failed", "VALIDATION_ERROR", 400);
  }
  if (error instanceof AppError) {
    return jsonError(error.message, error.code as ErrorCode, error.statusCode);
  }
  const message = getErrorMessage(error);
  console.error("[api]", message);
  return jsonError(message, "GENERATION_FAILED", 500);
}

/**
 * Wraps an async handler so all thrown errors become consistent JSON
 * responses. Handlers receive the authenticated uid automatically.
 */
export function withAuth<TArgs extends unknown[], TData>(
  handler: (uid: string, ...args: TArgs) => Promise<NextResponse<ApiEnvelope<TData>>>
) {
  return async (...args: TArgs): Promise<NextResponse<ApiEnvelope<TData>>> => {
    try {
      const uid = await authenticateAction();
      return await handler(uid, ...args);
    } catch (error) {
      return errorToResponse(error);
    }
  };
}

/**
 * Validates a request's JSON body against a Zod schema.
 * Throws ValidationError on a malformed body so the wrapper emits 400.
 */
export async function parseJsonBody<T extends ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
  return schema.parse(raw);
}
