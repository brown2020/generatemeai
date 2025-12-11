/**
 * Custom application error with additional context.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error codes for consistent error handling across the app.
 */
export const ErrorCodes = {
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  INVALID_API_KEY: "INVALID_API_KEY",
  GENERATION_FAILED: "GENERATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Extracts error message from unknown error type.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
};

/**
 * Standard server action response type.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };

/**
 * Handles errors in server actions and returns standardized response.
 */
export const handleServerActionError = (
  error: unknown,
  context: string
): ActionResult<never> => {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message);

  if (error instanceof AppError) {
    return {
      success: false,
      error: message,
      code: error.code as ErrorCode,
    };
  }

  return { success: false, error: message };
};

/**
 * Creates a successful action result.
 */
export const successResult = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
});

/**
 * Creates a failed action result.
 */
export const errorResult = (
  error: string,
  code?: ErrorCode
): ActionResult<never> => ({
  success: false,
  error,
  code,
});

/**
 * Type guard for Firebase errors.
 */
export const isFirebaseError = (
  error: unknown
): error is { code: string; message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
};
