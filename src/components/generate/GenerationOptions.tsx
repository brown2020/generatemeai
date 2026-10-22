"use client";

import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { artStyles } from "@/constants/artStyles";
import {
  ASPECT_RATIOS,
  getImageModels,
  getMaxImages,
  supportsAspectRatio,
  supportsNegativePrompt,
  type Model,
} from "@/constants/modelRegistry";
import { generationCreditCost } from "@/utils/creditCost";
import { PaginatedGrid } from "@/components/common/PaginatedGrid";
import { ModelCard, StyleCard } from "@/components/generation/SelectableCard";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import { GeneratedImagePreview, GenerationSettings } from "@/components/generate";
import { Button } from "@/components/ui";

const imageModels = getImageModels();

interface GenerationOptionsProps {
  loading: boolean;
  useCredits: boolean;
  isPromptValid: boolean;
  isModelValid: boolean;
  onGenerate: () => void;
}

const GenerationSettingsWrapper = memo(function GenerationSettingsWrapper() {
  const settingsState = useGenerationStore(
    useShallow((s) => ({
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

  return <GenerationSettings store={settingsState} />;
});

export function GenerationOptions({
  loading,
  useCredits,
  isPromptValid,
  isModelValid,
  onGenerate,
}: GenerationOptionsProps) {
  const formState = useGenerationStore(
    useShallow((s) => ({
      negativePrompt: s.negativePrompt,
      imageStyle: s.imageStyle,
      model: s.model,
      aspectRatio: s.aspectRatio,
      imageCount: s.imageCount,
    }))
  );
  const outputState = useGenerationStore(
    useShallow((s) => ({
      generatedImage: s.generatedImage,
      generatedImages: s.generatedImages,
      colorScheme: s.colorScheme,
      lighting: s.lighting,
      perspective: s.perspective,
      composition: s.composition,
      medium: s.medium,
      mood: s.mood,
    }))
  );
  const updateField = useGenerationStore((s) => s.updateField);

  const showAspectRatio = supportsAspectRatio(formState.model);
  const showNegativePrompt = supportsNegativePrompt(formState.model);
  const maxImages = getMaxImages(formState.model);
  const creditCost = useMemo(
    () => generationCreditCost(formState.model, formState.imageCount),
    [formState.model, formState.imageCount]
  );

  const handleModelSelect = useCallback(
    (modelValue: string) => {
      updateField("model", modelValue as Model);
    },
    [updateField]
  );
  const handleStyleSelect = useCallback(
    (styleValue: string) => {
      updateField("imageStyle", styleValue);
    },
    [updateField]
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">AI Model</p>
          <PaginatedGrid
            items={imageModels}
            itemsPerPage={8}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            renderItem={(modelOption) => (
              <ModelCard
                key={modelOption.value}
                item={modelOption}
                isSelected={formState.model === modelOption.value}
                onClick={() => handleModelSelect(modelOption.value)}
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Artistic Style</p>
          <PaginatedGrid<{ value: string; label: string }>
            items={artStyles}
            itemsPerPage={8}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            renderItem={(style) => (
              <StyleCard
                key={style.value}
                item={style}
                isSelected={formState.imageStyle === style.value}
                onClick={() => handleStyleSelect(style.value)}
              />
            )}
          />
        </div>
      </div>

      {showNegativePrompt && (
        <div className="space-y-1">
          <label htmlFor="negative-prompt" className="text-sm font-medium text-gray-700">
            Negative Prompt
            <span className="text-gray-400 font-normal ml-1">(what to exclude)</span>
          </label>
          <textarea
            id="negative-prompt"
            value={formState.negativePrompt}
            onChange={(e) => updateField("negativePrompt", e.target.value)}
            placeholder="e.g. blurry, low quality, watermark, text…"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {showAspectRatio && (
          <div className="flex-1 min-w-[200px] space-y-2">
            <p className="text-sm font-medium text-gray-700">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  aria-pressed={formState.aspectRatio === ar.value}
                  onClick={() => updateField("aspectRatio", ar.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    formState.aspectRatio === ar.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {maxImages > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Images</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4]
                .filter((n) => n <= maxImages)
                .map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={formState.imageCount === n}
                    aria-label={`${n} ${n === 1 ? "image" : "images"}`}
                    onClick={() => updateField("imageCount", n)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg border transition-colors ${
                      formState.imageCount === n
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <GenerationSettingsWrapper />

      <div className="sticky bottom-0 z-10 -mx-3 border-t border-gray-100 bg-white/95 px-3 py-3 backdrop-blur-sm">
        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!isPromptValid || !isModelValid}
          onClick={onGenerate}
        >
          {loading
            ? "Generating…"
            : `Generate${formState.imageCount > 1 ? ` ${formState.imageCount} Images` : " Image"}`}
          {useCredits && !loading && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {creditCost} credits
            </span>
          )}
        </Button>
      </div>

      <div className="w-full">
        <GeneratedImagePreview
          imageUrl={outputState.generatedImage}
          imageUrls={outputState.generatedImages}
          showPreviewMarker={
            process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING === "true"
          }
          colorScheme={outputState.colorScheme}
          lighting={outputState.lighting}
          perspective={outputState.perspective}
          composition={outputState.composition}
          medium={outputState.medium}
          mood={outputState.mood}
          onSelectImage={(url) => updateField("generatedImage", url)}
        />
      </div>
    </>
  );
}
