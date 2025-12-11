/**
 * Hooks module exports.
 * Import from "@/hooks" for cleaner imports.
 */

// Auth hooks
export {
  useAuthUid,
  useRequireAuth,
  useAuthUser,
  getAuthenticatedUid,
  isAuthenticated,
} from "./useAuth";
export { useAuthLogic } from "./useAuthLogic";
export { default as useAuthToken } from "./useAuthToken";

// Generation hooks
export { useImageGenerator } from "./useImageGenerator";
export { useGenerationHistory } from "./useGenerationHistory";
export { useSpeechRecognition } from "./useSpeechRecognition";
export { usePreviewSaver } from "./usePreviewSaver";

// UI hooks
export { useNavigation } from "./useNavigation";
export { useUrlSync } from "./useUrlSync";
export { useDebouncedCallback, useDebouncedValue } from "./useDebounce";
export { useClipboard } from "./useClipboard";
