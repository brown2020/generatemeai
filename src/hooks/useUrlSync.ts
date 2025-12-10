import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import { colors, findColorByValue, findColorByLabel } from "@/constants/colors";
import {
  lightings,
  findLightingByValue,
  findLightingByLabel,
} from "@/constants/lightings";
import { model } from "@/types/model";

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

    // Get stable action references from the store
    const store = useGenerationStore.getState();

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
    if (params.freestyle) store.setImagePrompt(params.freestyle);
    if (params.style) store.setImageStyle(params.style);
    if (params.model) store.setModel(params.model as model);

    // Handle color with value/label lookup
    if (params.color) {
      const colorOption =
        findColorByValue(params.color) || findColorByLabel(params.color);
      if (colorOption) store.setColorScheme(colorOption.label);
    }

    // Handle lighting with value/label lookup
    if (params.lighting) {
      const lightingOption =
        findLightingByValue(params.lighting) ||
        findLightingByLabel(params.lighting);
      if (lightingOption) store.setLighting(lightingOption.label);
    }

    if (params.tags) store.setTags(params.tags);
    if (params.imageCategory) store.setSelectedCategory(params.imageCategory);
    if (params.perspective) store.setPerspective(params.perspective);
    if (params.composition) store.setComposition(params.composition);
    if (params.medium) store.setMedium(params.medium);
    if (params.mood) store.setMood(params.mood);

    // Load image reference asynchronously
    if (params.imageReference) {
      loadImageFromUrl(params.imageReference, store.setUploadedImage);
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
