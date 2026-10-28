"use client";

import { useEffect, useRef, useCallback, ChangeEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { RotateCcw } from "lucide-react";
import { creditsToMinus, supportsImageUpload } from "@/constants/modelRegistry";
import { optimizePrompt } from "@/utils/promptOptimizer";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";

import { PromptInput } from "@/components/generate";
import { GenerationOptions } from "@/components/generate/GenerationOptions";
import { Button } from "@/components/ui";

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
      model: s.model,
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

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      storeActions.updateField("imagePrompt", e.target.value);
    },
    [storeActions]
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
      await useProfileStore.getState().fetchProfile();
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
      <h1 className="sr-only">Generate images</h1>
      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            leftIcon={<RotateCcw size={16} aria-hidden />}
          >
            Reset Form
          </Button>
        </div>

        <PromptInput
          value={formState.imagePrompt}
          onChange={handlePromptChange}
          onOptimize={handleOptimizePrompt}
          optimizeCreditCost={
            profileData.useCredits ? creditsToMinus("chatgpt") : undefined
          }
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
