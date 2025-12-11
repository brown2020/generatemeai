import { useCallback } from "react";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import { artStyles } from "@/constants/artStyles";
import { normalizeValue } from "@/utils/imageUtils";
import { getPerspectiveFromLabel } from "@/constants/perspectives";
import { getCompositionFromLabel } from "@/constants/compositions";
import { getMediumFromLabel } from "@/constants/mediums";
import { getMoodFromLabel } from "@/constants/moods";
import toast from "react-hot-toast";

type PreviewType =
  | "model"
  | "color"
  | "lighting"
  | "style"
  | "perspective"
  | "composition"
  | "medium"
  | "mood";

interface ValueResolver {
  getValue: () => string;
  transform?: (value: string) => string;
  blockNone?: boolean;
}

export const usePreviewSaver = () => {
  const {
    generatedImage,
    model,
    colorScheme,
    lighting,
    imageStyle,
    perspective,
    composition,
    medium,
    mood,
    setShowMarkAsPreview,
    setPreview,
  } = useGenerationStore();

  // Value resolvers for each preview type
  const valueResolvers: Record<PreviewType, ValueResolver> = {
    model: { getValue: () => model },
    color: { getValue: () => colorScheme, blockNone: true },
    lighting: { getValue: () => lighting, blockNone: true },
    style: {
      getValue: () => imageStyle,
      transform: (val) => {
        const styleObj = artStyles.find((s) => s.label === val);
        return styleObj ? normalizeValue(styleObj.value) : normalizeValue(val);
      },
    },
    perspective: {
      getValue: () => perspective,
      transform: getPerspectiveFromLabel,
      blockNone: true,
    },
    composition: {
      getValue: () => composition,
      transform: getCompositionFromLabel,
      blockNone: true,
    },
    medium: {
      getValue: () => medium,
      transform: getMediumFromLabel,
      blockNone: true,
    },
    mood: {
      getValue: () => mood,
      transform: getMoodFromLabel,
      blockNone: true,
    },
  };

  const saveAsPreview = useCallback(
    async (type: PreviewType) => {
      if (!generatedImage) return;

      const resolver = valueResolvers[type];
      const rawValue = resolver.getValue();

      // Check for "None" values
      if (resolver.blockNone && rawValue === "None") {
        toast.error("Cannot save 'None' as a preview");
        return;
      }

      // Transform value if needed
      const value = resolver.transform
        ? resolver.transform(rawValue)
        : rawValue;

      if (!value) {
        toast.error(`Please select a ${type} first`);
        return;
      }

      try {
        const loadingToast = toast.loading("Saving preview...");

        const response = await fetch("/api/previews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: generatedImage,
            type: `${type}s`,
            value,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save preview");
        }

        toast.success(`Saved as preview for ${type}: ${value}`, {
          id: loadingToast,
        });
        setShowMarkAsPreview(false);
        setPreview(null, null);
      } catch (error) {
        toast.error("Failed to save preview image");
        console.error(error);
      }
    },
    [
      generatedImage,
      model,
      colorScheme,
      lighting,
      imageStyle,
      perspective,
      composition,
      medium,
      mood,
      setShowMarkAsPreview,
      setPreview,
    ]
  );

  return { saveAsPreview };
};
