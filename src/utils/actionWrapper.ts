/**
 * Server action wrapper utilities for consistent error handling.
 * Reduces boilerplate across all server actions.
 */

import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  ErrorCode,
} from "./errors";

/**
 * Wraps an async function with consistent error handling for server actions.
 * Automatically catches errors and returns standardized ActionResult.
 *
 * @param fn - The async function to wrap
 * @param context - Context string for error logging (e.g., "generateImage")
 * @param defaultErrorCode - Default error code if not an AppError
 *
 * @example
 * export const myAction = withActionHandler(
 *   async (data: FormData) => {
 *     // Your logic here - just throw on error
 *     const result = await doSomething();
 *     return { data: result };
 *   },
 *   "myAction"
 * );
 */
export function withActionHandler<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>,
  context: string,
  defaultErrorCode: ErrorCode = "GENERATION_FAILED"
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const result = await fn(input);
      return successResult(result);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error(`[${context}]`, message);
      return errorResult(message, defaultErrorCode);
    }
  };
}

/**
 * Type-safe form data extractor with validation.
 */
export function extractFormData<T extends Record<string, unknown>>(
  formData: FormData,
  schema: {
    [K in keyof T]: {
      type: "string" | "number" | "boolean" | "file";
      required?: boolean;
    };
  }
): { success: true; data: T } | { success: false; error: string } {
  const result = {} as T;

  for (const [key, config] of Object.entries(schema)) {
    const value = formData.get(key);

    if (config.required && (value === null || value === "")) {
      return { success: false, error: `Missing required field: ${key}` };
    }

    if (value === null) {
      continue;
    }

    switch (config.type) {
      case "string":
        (result as Record<string, unknown>)[key] = value as string;
        break;
      case "number":
        (result as Record<string, unknown>)[key] = Number(value);
        break;
      case "boolean":
        (result as Record<string, unknown>)[key] = value === "true";
        break;
      case "file":
        (result as Record<string, unknown>)[key] = value as File;
        break;
    }
  }

  return { success: true, data: result };
}
