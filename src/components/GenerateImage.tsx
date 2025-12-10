"use client";

import TextareaAutosize from "react-textarea-autosize";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useRef, useCallback, useMemo, ChangeEvent } from "react";
import { artStyles } from "@/constants/artStyles";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { models, SelectModel } from "@/constants/models";
import { colors } from "@/constants/colors";
import { lightings } from "@/constants/lightings";
import { suggestTags } from "@/actions/suggestTags";
import {
  Mic,
  StopCircle,
  XCircle,
  ImagePlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { perspectives } from "@/constants/perspectives";
import { compositions } from "@/constants/compositions";
import { mediums } from "@/constants/mediums";
import { moods } from "@/constants/moods";
import { optimizePrompt } from "@/utils/promptOptimizer";

import { SettingsSelector } from "@/components/generation/SettingsSelector";
import { PaginatedGrid } from "@/components/common/PaginatedGrid";
import { ModelCard } from "@/components/generation/ModelCard";
import { StyleCard } from "@/components/generation/StyleCard";
import { PreviewMarker } from "@/components/generation/PreviewMarker";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { model } from "@/types/model";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useImageGenerator } from "@/hooks/useImageGenerator";

const isPreviewMarkingEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING === "true";

export default function GenerateImage() {
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);

  // Generation Store
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
    previewValue,
    setImagePrompt,
    setImageStyle,
    setModel,
    setColorScheme,
    setLighting,
    setPerspective,
    setComposition,
    setMedium,
    setMood,
    setSuggestedTags,
    setUploadedImage,
    setIsOptimizing,
    setPreview,
    reset,
  } = useGenerationStore();

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const suggestions = await suggestTags(
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

      // Handle error response
      if (typeof suggestions === "object" && suggestions.error) return;

      // Handle successful string response
      if (typeof suggestions === "string") {
        const suggestionList = suggestions.split(",").map((s) => s.trim());
        if (suggestionList.length >= 1) {
          setSuggestedTags(suggestionList);
        }
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

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setImagePrompt(e.target.value);
      handleTagSuggestions(e.target.value);
    },
    [setImagePrompt, handleTagSuggestions]
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setUploadedImage]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Memoized settings configuration
  const settingsConfig = useMemo(
    () => [
      {
        label: "Color Scheme",
        options: colors,
        value: colorScheme,
        onChange: setColorScheme,
        type: "color" as const,
      },
      {
        label: "Lighting",
        options: lightings,
        value: lighting,
        onChange: setLighting,
        type: "lighting" as const,
      },
      {
        label: "Perspective",
        options: perspectives,
        value: perspective,
        onChange: setPerspective,
        type: "perspective" as const,
      },
      {
        label: "Composition",
        options: compositions,
        value: composition,
        onChange: setComposition,
        type: "composition" as const,
      },
      {
        label: "Medium",
        options: mediums,
        value: medium,
        onChange: setMedium,
        type: "medium" as const,
      },
      {
        label: "Mood",
        options: moods,
        value: mood,
        onChange: setMood,
        type: "mood" as const,
      },
    ],
    [
      colorScheme,
      lighting,
      perspective,
      composition,
      medium,
      mood,
      setColorScheme,
      setLighting,
      setPerspective,
      setComposition,
      setMedium,
      setMood,
    ]
  );

  // Filter models for image generation
  const imageModels = useMemo(
    () => models.filter((m) => m.type === "image" || m.type === "both"),
    []
  );

  const supportsImageUpload = model !== "dall-e" && model !== "flux-schnell";

  return (
    <div className="flex flex-col items-center w-full p-3 bg-white">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex flex-col w-full max-w-4xl space-y-4 relative">
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All Options
          </button>
        </div>

        <div className="relative rounded-lg">
          <TextareaAutosize
            autoFocus
            minRows={3}
            maxRows={5}
            value={imagePrompt || ""}
            placeholder="Describe your image in detail..."
            onChange={handlePromptChange}
            className="block w-full px-4 py-3 pr-32 text-lg border-2 border-blue-200 
              rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              transition-all duration-200 ease-in-out"
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {supportsImageUpload && (
              <button
                onClick={handleUploadClick}
                className="group relative inline-flex items-center justify-center w-9 h-9 
                  rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 
                  transition-all duration-200 hover:shadow-md"
                title="Upload reference image"
              >
                <ImagePlus className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
            )}

            <button
              onClick={toggleRecording}
              className={`group relative inline-flex items-center justify-center w-9 h-9 
                rounded-lg transition-all duration-200 hover:shadow-md
                ${
                  isRecording
                    ? "bg-red-50 hover:bg-red-100 border border-red-200"
                    : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                }`}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5 text-red-600 group-hover:text-red-700" />
              ) : (
                <Mic className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              )}
            </button>

            <button
              onClick={handleOptimizePrompt}
              disabled={!imagePrompt || isOptimizing}
              className={`group relative inline-flex items-center justify-center w-9 h-9 
                rounded-lg transition-all duration-200 hover:shadow-md
                ${
                  !imagePrompt || isOptimizing
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-purple-50 hover:bg-purple-100 border border-purple-200"
                }`}
              title="Enhance prompt with AI"
            >
              {isOptimizing ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <Sparkles
                  className={`w-5 h-5 ${
                    !imagePrompt
                      ? "text-gray-400"
                      : "text-purple-600 group-hover:text-purple-700"
                  } transition-colors`}
                />
              )}
            </button>
          </div>
        </div>

        {supportsImageUpload && uploadedImage && (
          <div className="relative inline-block">
            <div className="relative group">
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Reference"
                className="w-40 h-40 object-cover rounded-lg border-2 border-blue-600 shadow-md transition-transform hover:scale-105"
              />
              <button
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-md"
                onClick={handleRemoveImage}
                title="Remove Image"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsConfig.map((setting) => (
            <SettingsSelector
              key={setting.type}
              label={setting.label}
              options={setting.options}
              currentValue={setting.value}
              onChange={setting.onChange}
              type={setting.type}
              previewType={previewType}
              previewValue={previewValue}
              setPreview={setPreview}
            />
          ))}
        </div>

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
          {generatedImage ? (
            <div className="animate-fade-in relative">
              <img
                className="w-full max-h-[50vh] rounded-lg shadow-lg object-contain"
                src={generatedImage}
                alt="Generated visualization"
              />

              {isPreviewMarkingEnabled && (
                <PreviewMarker
                  generatedImage={generatedImage}
                  colorScheme={colorScheme}
                  lighting={lighting}
                  perspective={perspective}
                  composition={composition}
                  medium={medium}
                  mood={mood}
                />
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              Your generated image will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
