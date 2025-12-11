import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import { colors, findColorByValue, findColorByLabel } from "@/constants/colors";
import {
  lightings,
  findLightingByValue,
  findLightingByLabel,
} from "@/constants/lightings";
import type { Model } from "@/constants/modelRegistry";

/**
 * Syncs URL search parameters to the generation store.
 * Uses stable store references to avoid unnecessary re-renders.
 */
export const useUrlSync = () => {
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount to prevent re-syncing on every render
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Get stable action reference from the store
    const { updateField } = useGenerationStore.getState();

    // Parse all search params
    const params = {
      freestyle: searchParams.get("freestyle"),
      style: searchParams.get("style"),
      model: searchParams.get("model"),
      color: searchParams.get("color"),
      lighting: searchParams.get("lighting"),
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      imageReference: searchParams.get("imageReference"),
      imageCategory: searchParams.get("imageCategory"),
      perspective: searchParams.get("perspective"),
      composition: searchParams.get("composition"),
      medium: searchParams.get("medium"),
      mood: searchParams.get("mood"),
    };

    // Apply params to store
    if (params.freestyle) updateField("imagePrompt", params.freestyle);
    if (params.style) updateField("imageStyle", params.style);
    if (params.model) updateField("model", params.model as Model);

    // Handle color with value/label lookup
    if (params.color) {
      const colorOption =
        findColorByValue(params.color) || findColorByLabel(params.color);
      if (colorOption) updateField("colorScheme", colorOption.label);
    }

    // Handle lighting with value/label lookup
    if (params.lighting) {
      const lightingOption =
        findLightingByValue(params.lighting) ||
        findLightingByLabel(params.lighting);
      if (lightingOption) updateField("lighting", lightingOption.label);
    }

    if (params.tags) updateField("tags", params.tags);
    if (params.imageCategory)
      updateField("selectedCategory", params.imageCategory);
    if (params.perspective) updateField("perspective", params.perspective);
    if (params.composition) updateField("composition", params.composition);
    if (params.medium) updateField("medium", params.medium);
    if (params.mood) updateField("mood", params.mood);

    // Load image reference asynchronously
    if (params.imageReference) {
      loadImageFromUrl(params.imageReference, (file) =>
        updateField("uploadedImage", file)
      );
    }
  }, [searchParams]);
};

/**
 * Loads an image from a URL and sets it as the uploaded image.
 */
async function loadImageFromUrl(
  url: string,
  setUploadedImage: (file: File | null) => void
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "reference-image.jpg", { type: blob.type });
    setUploadedImage(file);
  } catch (error) {
    console.error("Failed to load image from URL:", error);
  }
}
