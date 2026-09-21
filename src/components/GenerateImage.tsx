"use client";

import { useEffect, useRef, useCallback, ChangeEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { supportsImageUpload } from "@/constants/modelRegistry";
import { suggestTags } from "@/actions/suggestTags";
import { optimizePrompt } from "@/utils/promptOptimizer";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";

import { PromptInput } from "@/components/generate";
import { GenerationOptions } from "@/components/generate/GenerationOptions";

/**
 * Main image generation component.
 * Optimized with selective store subscriptions and memoization.
 */
function GenerateImage() {
  // Profile selectors - minimal subscriptions
  const profileData = useProfileStore(
    useShallow((s) => ({
      openAPIKey: s.profile.openai_api_key,
      useCredits: s.profile.useCredits,
      credits: s.profile.credits,
    }))
  );

  // Generation store - UI state
  const uiState = useGenerationStore(
    useShallow((s) => ({
      loading: s.loading,
      isRecording: s.isRecording,
      isOptimizing: s.isOptimizing,
      previewType: s.previewType,
    }))
  );

  // Generation store - form state
  const formState = useGenerationStore(
    useShallow((s) => ({
      imagePrompt: s.imagePrompt,
      negativePrompt: s.negativePrompt,
      imageStyle: s.imageStyle,
      model: s.model,
      aspectRatio: s.aspectRatio,
      imageCount: s.imageCount,
      colorScheme: s.colorScheme,
      lighting: s.lighting,
      selectedCategory: s.selectedCategory,
      tags: s.tags,
      uploadedImage: s.uploadedImage,
    }))
  );

  // Get store actions (stable references)
  const storeActions = useGenerationStore(
    useShallow((s) => ({
      updateField: s.updateField,
      setPreview: s.setPreview,
      reset: s.reset,
    }))
  );

  const previewRef = useRef<HTMLDivElement>(null);

  // Hooks
  useUrlSync();
  const { generate } = useImageGenerator();

  const { isRecording, startRecording, stopRecording } = useSpeechRecognition(
    (transcript) => storeActions.updateField("imagePrompt", transcript)
  );

  const isPromptValid = !!formState.imagePrompt.trim();
  const isModelValid = !!formState.model;
  const modelSupportsUpload = supportsImageUpload(formState.model);

  // Click outside handler for preview type selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        uiState.previewType &&
        previewRef.current &&
        !previewRef.current.contains(event.target as Node)
      ) {
        storeActions.setPreview(null, null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [uiState.previewType, storeActions]);

  // Tag suggestion handler
  const handleTagSuggestions = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      const result = await suggestTags(
        prompt,
        formState.colorScheme,
        formState.lighting,
        formState.imageStyle,
        formState.selectedCategory,
        formState.tags,
        profileData.openAPIKey,
        profileData.useCredits,
        profileData.credits
      );

      if (!result.success) return;

      const suggestionList = result.data.split(",").map((s) => s.trim());
      if (suggestionList.length >= 1) {
        storeActions.updateField("suggestedTags", suggestionList);
      }
    },
    [formState, profileData, storeActions]
  );

  const debouncedTagSuggestions = useDebouncedCallback(
    handleTagSuggestions,
    500
  );

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      storeActions.updateField("imagePrompt", e.target.value);
      debouncedTagSuggestions(e.target.value);
    },
    [storeActions, debouncedTagSuggestions]
  );

  const handleClearAll = useCallback(() => {
    storeActions.reset();
  }, [storeActions]);

  const handleOptimizePrompt = useCallback(async () => {
    if (!formState.imagePrompt || uiState.isOptimizing) return;

    try {
      storeActions.updateField("isOptimizing", true);
      const optimizedPrompt = await optimizePrompt(
        formState.imagePrompt,
        profileData.openAPIKey
      );
      storeActions.updateField("imagePrompt", optimizedPrompt);
      toast.success("Prompt optimized!");
    } catch (error) {
      toast.error("Failed to optimize prompt. Please try again.");
      console.error("Optimization error:", error);
    } finally {
      storeActions.updateField("isOptimizing", false);
    }
  }, [
    formState.imagePrompt,
    uiState.isOptimizing,
    profileData.openAPIKey,
    storeActions,
  ]);

  const handleImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        storeActions.updateField("uploadedImage", file);
      }
    },
    [storeActions]
  );

  const handleRemoveImage = useCallback(() => {
    storeActions.updateField("uploadedImage", null);
  }, [storeActions]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className="flex flex-col items-center w-full p-3 bg-white">
      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All Options
          </button>
        </div>

        <PromptInput
          value={formState.imagePrompt}
          onChange={handlePromptChange}
          onOptimize={handleOptimizePrompt}
          onUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onToggleRecording={toggleRecording}
          isRecording={isRecording}
          isOptimizing={uiState.isOptimizing}
          supportsImageUpload={modelSupportsUpload}
          uploadedImage={formState.uploadedImage}
        />

        <GenerationOptions
          loading={uiState.loading}
          useCredits={profileData.useCredits}
          isPromptValid={isPromptValid}
          isModelValid={isModelValid}
          onGenerate={generate}
        />
      </div>
    </div>
  );
}

export default GenerateImage;
