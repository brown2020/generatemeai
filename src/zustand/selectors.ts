/**
 * Optimized Zustand selectors using useShallow for better performance.
 * Import these instead of selecting multiple individual state pieces.
 */

import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./useAuthStore";
import useProfileStore from "./useProfileStore";
import { useGenerationStore } from "./useGenerationStore";

/**
 * Auth store selectors
 */
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

/**
 * Profile store selectors
 */
export const useProfileCredits = () =>
  useProfileStore(
    useShallow((s) => ({
      credits: s.profile.credits,
      useCredits: s.profile.useCredits,
      minusCredits: s.minusCredits,
      addCredits: s.addCredits,
    }))
  );

export const useProfileApiKeys = () =>
  useProfileStore(
    useShallow((s) => ({
      openai_api_key: s.profile.openai_api_key,
      fireworks_api_key: s.profile.fireworks_api_key,
      stability_api_key: s.profile.stability_api_key,
      replicate_api_key: s.profile.replicate_api_key,
      ideogram_api_key: s.profile.ideogram_api_key,
      bria_api_key: s.profile.bria_api_key,
      did_api_key: s.profile.did_api_key,
      runway_ml_api_key: s.profile.runway_ml_api_key,
    }))
  );

/**
 * Generation store selectors
 */
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
      setImagePrompt: s.setImagePrompt,
      setImageStyle: s.setImageStyle,
      setModel: s.setModel,
      setColorScheme: s.setColorScheme,
      setLighting: s.setLighting,
      setPerspective: s.setPerspective,
      setComposition: s.setComposition,
      setMedium: s.setMedium,
      setMood: s.setMood,
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
      setTags: s.setTags,
      setSuggestedTags: s.setSuggestedTags,
      setSelectedCategory: s.setSelectedCategory,
    }))
  );
