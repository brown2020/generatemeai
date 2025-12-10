/**
 * Custom error types for consistent error handling across the application.
 */

/**
 * Base application error class.
 * Extends Error with additional properties for better error handling.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when user doesn't have sufficient credits.
 */
export class InsufficientCreditsError extends AppError {
  constructor(
    message: string = "Not enough credits. Please purchase credits or use your own API keys."
  ) {
    super(message, "INSUFFICIENT_CREDITS", 402);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Error thrown when authentication is required but not present.
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required.") {
    super(message, "AUTHENTICATION_REQUIRED", 401);
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
    super(message, "AUTHORIZATION_FAILED", 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found.`, "NOT_FOUND", 404);
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
    super(message, "VALIDATION_ERROR", 400);
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
      "EXTERNAL_API_ERROR",
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
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extracts a user-friendly error message from any error.
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

/**
 * Extracts error code from any error, with fallback.
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
}
