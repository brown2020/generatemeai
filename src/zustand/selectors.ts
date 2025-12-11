/**
 * Optimized Zustand selectors using useShallow for better performance.
 * Import these instead of selecting multiple individual state pieces.
 */

import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./useAuthStore";
import useProfileStore, { ProfileType } from "./useProfileStore";
import { useGenerationStore, GenerationStore } from "./useGenerationStore";

// ============================================================================
// Selector Factory
// ============================================================================

/**
 * Creates a typed selector for profile fields.
 */
function createProfileSelector<K extends keyof ProfileType>(keys: K[]) {
  return () =>
    useProfileStore(
      useShallow((s) => {
        const result = {} as Pick<ProfileType, K>;
        for (const key of keys) {
          result[key] = s.profile[key];
        }
        return result;
      })
    );
}

// ============================================================================
// Auth store selectors
// ============================================================================

export const useAuthState = () =>
  useAuthStore(
    useShallow((s) => ({
      uid: s.uid,
      authEmail: s.authEmail,
      authDisplayName: s.authDisplayName,
      authPhotoUrl: s.authPhotoUrl,
      authReady: s.authReady,
      authPending: s.authPending,
    }))
  );

export const useAuthUser = () =>
  useAuthStore(
    useShallow((s) => ({
      uid: s.uid,
      authDisplayName: s.authDisplayName,
      authPhotoUrl: s.authPhotoUrl,
    }))
  );

export const useAuthStatus = () =>
  useAuthStore(
    useShallow((s) => ({
      isAuthenticated: !!s.uid,
      isReady: s.authReady,
      isPending: s.authPending,
    }))
  );

// ============================================================================
// Profile store selectors
// ============================================================================

export const useProfileCredits = createProfileSelector([
  "credits",
  "useCredits",
]);

export const useProfileApiKeys = createProfileSelector([
  "openai_api_key",
  "fireworks_api_key",
  "stability_api_key",
  "replicate_api_key",
  "ideogram_api_key",
  "bria_api_key",
  "did_api_key",
  "runway_ml_api_key",
]);

export const useProfileInfo = createProfileSelector([
  "email",
  "displayName",
  "photoUrl",
]);

// ============================================================================
// Generation store selectors
// ============================================================================

export const useGenerationParams = () =>
  useGenerationStore(
    useShallow((s) => ({
      imagePrompt: s.imagePrompt,
      imageStyle: s.imageStyle,
      model: s.model,
      colorScheme: s.colorScheme,
      lighting: s.lighting,
      perspective: s.perspective,
      composition: s.composition,
      medium: s.medium,
      mood: s.mood,
    }))
  );

export const useGenerationActions = () =>
  useGenerationStore(
    useShallow((s) => ({
      updateField: s.updateField,
      updateFields: s.updateFields,
      setPreview: s.setPreview,
      reset: s.reset,
    }))
  );

export const useGenerationUIState = () =>
  useGenerationStore(
    useShallow((s) => ({
      loading: s.loading,
      isOptimizing: s.isOptimizing,
      isRecording: s.isRecording,
      generatedImage: s.generatedImage,
      previewType: s.previewType,
      previewValue: s.previewValue,
    }))
  );

export const useGenerationTags = () =>
  useGenerationStore(
    useShallow((s) => ({
      tags: s.tags,
      suggestedTags: s.suggestedTags,
      selectedCategory: s.selectedCategory,
    }))
  );

// ============================================================================
// Combined selectors for common use cases
// ============================================================================

/**
 * Selector for the GenerationSettings component.
 */
export const useGenerationSettingsState = () =>
  useGenerationStore(
    useShallow((s: GenerationStore) => ({
      colorScheme: s.colorScheme,
      lighting: s.lighting,
      perspective: s.perspective,
      composition: s.composition,
      medium: s.medium,
      mood: s.mood,
      previewType: s.previewType,
      previewValue: s.previewValue,
      updateField: s.updateField,
      setPreview: s.setPreview,
    }))
  );

/**
 * Selector for the PromptInput component.
 */
export const usePromptInputState = () =>
  useGenerationStore(
    useShallow((s) => ({
      imagePrompt: s.imagePrompt,
      uploadedImage: s.uploadedImage,
      isRecording: s.isRecording,
      isOptimizing: s.isOptimizing,
    }))
  );

/**
 * Selector for the image preview component.
 */
export const useImagePreviewState = () =>
  useGenerationStore(
    useShallow((s) => ({
      generatedImage: s.generatedImage,
      colorScheme: s.colorScheme,
      lighting: s.lighting,
      perspective: s.perspective,
      composition: s.composition,
      medium: s.medium,
      mood: s.mood,
    }))
  );
