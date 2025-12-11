/**
 * Utility module exports.
 * Import from "@/utils" for cleaner imports.
 */

// API and credits
export {
  resolveApiKey,
  resolveApiKeyFromForm,
  extractApiKeysFromForm,
} from "./apiKeyResolver";
export {
  validateCredits,
  validateCreditsFromForm,
  assertSufficientCredits,
} from "./creditValidator";
export { creditsToMinus } from "./credits";

// Async utilities
export { pollWithTimeout, pollWithTimeoutSafe, delay } from "./polling";
export type { PollingOptions, PollingResult } from "./polling";

// Error handling
export {
  AppError,
  ErrorCodes,
  getErrorMessage,
  handleServerActionError,
  successResult,
  errorResult,
  isFirebaseError,
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
