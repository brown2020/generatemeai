/**
 * Centralized error handling utilities.
 * Single source of truth for error types and handling across the application.
 */

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
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  AUTHORIZATION_FAILED: "AUTHORIZATION_FAILED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Base application error class with additional context.
 */
export class AppError extends Error {
  public readonly code: ErrorCode | string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode | string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when user doesn't have sufficient credits.
 */
export class InsufficientCreditsError extends AppError {
  constructor(
    message: string = "Not enough credits. Please purchase credits or use your own API keys."
  ) {
    super(message, ErrorCodes.INSUFFICIENT_CREDITS, 402);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Error thrown when authentication is required but not present.
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required.") {
    super(message, ErrorCodes.AUTHENTICATION_REQUIRED, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when user lacks permission for an action.
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "You don't have permission to perform this action."
  ) {
    super(message, ErrorCodes.AUTHORIZATION_FAILED, 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found.`, ErrorCodes.NOT_FOUND, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when input validation fails.
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(
    message: string = "Validation failed.",
    fields: Record<string, string> = {}
  ) {
    super(message, ErrorCodes.VALIDATION_ERROR, 400);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

/**
 * Error thrown when an external API call fails.
 */
export class ExternalApiError extends AppError {
  public readonly provider: string;

  constructor(provider: string, message: string, statusCode: number = 502) {
    super(
      `${provider} API error: ${message}`,
      ErrorCodes.EXTERNAL_API_ERROR,
      statusCode
    );
    this.name = "ExternalApiError";
    this.provider = provider;
  }
}

/**
 * Error thrown when rate limit is exceeded.
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Rate limit exceeded. Please try again later.",
    retryAfter?: number
  ) {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

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

// ============================================================================
// Error Message Extraction
// ============================================================================

/**
 * Extracts error message from unknown error type.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
};

/**
 * Extracts error code from any error, with fallback.
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
}

// ============================================================================
// Server Action Result Types
// ============================================================================

/**
 * Standard server action response type.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };

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
 * Handles errors in server actions and returns standardized response.
 */
export const handleServerActionError = (
  error: unknown,
  context: string
): ActionResult<never> => {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message);

  if (isAppError(error)) {
    return {
      success: false,
      error: message,
      code: error.code as ErrorCode,
    };
  }

  return { success: false, error: message };
};
