"use client";

import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useRef, useCallback, useMemo, ChangeEvent } from "react";
import { artStyles } from "@/constants/artStyles";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { models, SelectModel } from "@/constants/models";
import { suggestTags } from "@/actions/suggestTags";
import { optimizePrompt } from "@/utils/promptOptimizer";

import { PaginatedGrid } from "@/components/common/PaginatedGrid";
import { ModelCard } from "@/components/generation/ModelCard";
import { StyleCard } from "@/components/generation/StyleCard";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { model } from "@/types/model";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useImageGenerator } from "@/hooks/useImageGenerator";

import {
  PromptInput,
  GeneratedImagePreview,
  GenerationSettings,
} from "@/components/generate";

const isPreviewMarkingEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING === "true";

export default function GenerateImage() {
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);

  // Get the entire generation store for passing to sub-components
  const store = useGenerationStore();

  const {
    imagePrompt,
    imageStyle,
    model,
    colorScheme,
    lighting,
    perspective,
    composition,
    medium,
    mood,
    selectedCategory,
    tags,
    generatedImage,
    uploadedImage,
    loading,
    isOptimizing,
    previewType,
    setImagePrompt,
    setImageStyle,
    setModel,
    setSuggestedTags,
    setUploadedImage,
    setIsOptimizing,
    setPreview,
    reset,
  } = store;

  const previewRef = useRef<HTMLDivElement>(null);

  // Hooks
  useUrlSync();
  const { generate } = useImageGenerator();

  const { isRecording, startRecording, stopRecording } = useSpeechRecognition(
    (transcript) => setImagePrompt(transcript)
  );

  const isPromptValid = !!imagePrompt.trim();
  const isModelValid = !!model;

  // Click outside handler for preview type selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        previewType &&
        previewRef.current &&
        !previewRef.current.contains(event.target as Node)
      ) {
        setPreview(null, null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [previewType, setPreview]);

  // Memoized handlers
  const handleTagSuggestions = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      const result = await suggestTags(
        prompt,
        colorScheme,
        lighting,
        imageStyle,
        selectedCategory,
        tags,
        openAPIKey,
        useCredits,
        credits
      );

      // Handle ActionResult response
      if (!result.success) return;

      const suggestionList = result.data.split(",").map((s) => s.trim());
      if (suggestionList.length >= 1) {
        setSuggestedTags(suggestionList);
      }
    },
    [
      colorScheme,
      lighting,
      imageStyle,
      selectedCategory,
      tags,
      openAPIKey,
      useCredits,
      credits,
      setSuggestedTags,
    ]
  );

  // Debounce tag suggestions to avoid excessive API calls
  const debouncedTagSuggestions = useDebouncedCallback(
    handleTagSuggestions,
    500
  );

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setImagePrompt(e.target.value);
      debouncedTagSuggestions(e.target.value);
    },
    [setImagePrompt, debouncedTagSuggestions]
  );

  const handleClearAll = useCallback(() => {
    reset();
  }, [reset]);

  const handleOptimizePrompt = useCallback(async () => {
    if (!imagePrompt || isOptimizing) return;

    try {
      setIsOptimizing(true);
      const optimizedPrompt = await optimizePrompt(imagePrompt, openAPIKey);
      setImagePrompt(optimizedPrompt);
      toast.success("Prompt optimized!");
    } catch (error) {
      toast.error("Failed to optimize prompt. Please try again.");
      console.error("Optimization error:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, [imagePrompt, isOptimizing, openAPIKey, setImagePrompt, setIsOptimizing]);

  const handleImageUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedImage(file);
      }
    },
    [setUploadedImage]
  );

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
  }, [setUploadedImage]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Filter models for image generation
  const imageModels = useMemo(
    () => models.filter((m) => m.type === "image" || m.type === "both"),
    []
  );

  const supportsImageUpload = model !== "dall-e" && model !== "flux-schnell";

  return (
    <div className="flex flex-col items-center w-full p-3 bg-white">
      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All Options
          </button>
        </div>

        <PromptInput
          value={imagePrompt}
          onChange={handlePromptChange}
          onOptimize={handleOptimizePrompt}
          onUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onToggleRecording={toggleRecording}
          isRecording={isRecording}
          isOptimizing={isOptimizing}
          supportsImageUpload={supportsImageUpload}
          uploadedImage={uploadedImage}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              AI Model
            </label>
            <PaginatedGrid<SelectModel>
              items={imageModels}
              itemsPerPage={8}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              renderItem={(modelOption) => (
                <ModelCard
                  key={modelOption.value}
                  model={modelOption}
                  isSelected={model === modelOption.value}
                  onClick={() => setModel(modelOption.value as model)}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Artistic Style
            </label>
            <PaginatedGrid<{ value: string; label: string }>
              items={artStyles}
              itemsPerPage={8}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              renderItem={(style) => (
                <StyleCard
                  key={style.value}
                  style={style}
                  isSelected={imageStyle === style.value}
                  onClick={() => setImageStyle(style.value)}
                />
              )}
            />
          </div>
        </div>

        <GenerationSettings store={store} />

        <button
          className={`py-2 px-4 rounded-lg font-medium text-white transition-all
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]"
            }
            ${
              !isPromptValid || !isModelValid
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
          disabled={loading || !isPromptValid || !isModelValid}
          onClick={generate}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <PulseLoader color="#fff" size={12} />
            </div>
          ) : (
            "Generate Image"
          )}
        </button>

        <div className="w-full">
          <GeneratedImagePreview
            imageUrl={generatedImage}
            showPreviewMarker={isPreviewMarkingEnabled}
            colorScheme={colorScheme}
            lighting={lighting}
            perspective={perspective}
            composition={composition}
            medium={medium}
            mood={mood}
          />
        </div>
      </div>
    </div>
  );
}
