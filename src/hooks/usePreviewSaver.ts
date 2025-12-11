import { useCallback } from "react";
import {
  useGenerationStore,
  GenerationState,
} from "@/zustand/useGenerationStore";
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

interface ValueResolverConfig {
  storeKey: keyof GenerationState;
  transform?: (value: string) => string;
  blockNone?: boolean;
}

/**
 * Static configuration for value resolvers.
 * Defined outside the hook to prevent recreation on every render.
 */
const VALUE_RESOLVER_CONFIG: Record<PreviewType, ValueResolverConfig> = {
  model: { storeKey: "model" },
  color: { storeKey: "colorScheme", blockNone: true },
  lighting: { storeKey: "lighting", blockNone: true },
  style: {
    storeKey: "imageStyle",
    transform: (val) => {
      const styleObj = artStyles.find((s) => s.label === val);
      return styleObj ? normalizeValue(styleObj.value) : normalizeValue(val);
    },
  },
  perspective: {
    storeKey: "perspective",
    transform: getPerspectiveFromLabel,
    blockNone: true,
  },
  composition: {
    storeKey: "composition",
    transform: getCompositionFromLabel,
    blockNone: true,
  },
  medium: {
    storeKey: "medium",
    transform: getMediumFromLabel,
    blockNone: true,
  },
  mood: {
    storeKey: "mood",
    transform: getMoodFromLabel,
    blockNone: true,
  },
};

export const usePreviewSaver = () => {
  const generatedImage = useGenerationStore((s) => s.generatedImage);
  const updateField = useGenerationStore((s) => s.updateField);
  const setPreview = useGenerationStore((s) => s.setPreview);

  const saveAsPreview = useCallback(
    async (type: PreviewType) => {
      if (!generatedImage) return;

      // Get current store state
      const state = useGenerationStore.getState();
      const config = VALUE_RESOLVER_CONFIG[type];
      const rawValue = state[config.storeKey] as string;

      // Check for "None" values
      if (config.blockNone && rawValue === "None") {
        toast.error("Cannot save 'None' as a preview");
        return;
      }

      // Transform value if needed
      const value = config.transform ? config.transform(rawValue) : rawValue;

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
        updateField("showMarkAsPreview", false);
        setPreview(null, null);
      } catch (error) {
        toast.error("Failed to save preview image");
        console.error(error);
      }
    },
    [generatedImage, updateField, setPreview]
  );

  return { saveAsPreview };
};
