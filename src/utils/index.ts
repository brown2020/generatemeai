/**
 * Utility module exports.
 * Import from "@/utils" for cleaner imports.
 */

// API and credits (from centralized registry)
export { resolveApiKey, resolveApiKeyFromForm } from "./apiKeyResolver";
export { extractApiKeysFromForm } from "./apiKeyResolver";
export {
  validateCredits,
  validateCreditsFromForm,
  assertSufficientCredits,
} from "./creditValidator";
export { creditsToMinus } from "@/constants/modelRegistry";

// Async utilities
export { pollWithTimeout, pollWithTimeoutSafe, delay } from "./polling";
export type { PollingOptions, PollingResult } from "./polling";

// Error handling
export {
  // Error classes
  AppError,
  InsufficientCreditsError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ExternalApiError,
  RateLimitError,
  // Error constants
  ErrorCodes,
  // Error utilities
  getErrorMessage,
  getErrorCode,
  isAppError,
  isFirebaseError,
  // Server action helpers
  handleServerActionError,
  successResult,
  errorResult,
} from "./errors";
export type { ErrorCode, ActionResult } from "./errors";

// Prompt utilities
export {
  generatePrompt,
  generatePromptFromParts,
  extractKeywords,
  truncatePrompt,
} from "./promptUtils";
export { optimizePrompt, optimizePromptSafe } from "./promptOptimizer";

// Platform utilities
export { isIOSReactNativeWebView, checkRestrictedWords } from "./platform";

// Misc utilities
export { cn } from "./cn";
export { default as convertToSubcurrency } from "./convertToSubcurrency";
export { resizeImage } from "./resizeImage";
