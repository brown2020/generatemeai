import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useGenerationHistory } from "@/hooks/useGenerationHistory";
import { generatePrompt } from "@/utils/promptUtils";
import { generateImage } from "@/actions/generateImage";
import { creditsToMinus } from "@/constants/modelRegistry";
import { createImageGenerationFormData } from "@/utils/formDataBuilder";
import { colors, getColorFromLabel } from "@/constants/colors";
import { lightings, getLightingFromLabel } from "@/constants/lightings";
import {
  isIOSReactNativeWebView,
  checkRestrictedWords,
} from "@/utils/platform";
import toast from "react-hot-toast";

export const useImageGenerator = () => {
  const uid = useAuthStore((s) => s.uid);

  // Profile Store - get profile object for form builder
  const profile = useProfileStore((s) => s.profile);
  const minusCredits = useProfileStore((s) => s.minusCredits);

  // Generation Store - use shallow selector for performance
  const generationState = useGenerationStore(
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
      selectedCategory: s.selectedCategory,
      tags: s.tags,
      uploadedImage: s.uploadedImage,
      updateField: s.updateField,
    }))
  );

  const { saveHistory } = useGenerationHistory();

  const isPromptValid = !!generationState.imagePrompt.trim();
  const isModelValid = !!generationState.model;

  const generate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isPromptValid || !isModelValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (
      isIOSReactNativeWebView() &&
      checkRestrictedWords(generationState.imagePrompt)
    ) {
      toast.error(
        "Your description contains restricted words and cannot be used."
      );
      return;
    }

    try {
      generationState.updateField("loading", true);

      const prompt: string = generatePrompt(
        generationState.imagePrompt,
        generationState.imageStyle,
        getColorFromLabel(generationState.colorScheme) || colors[0].value,
        getLightingFromLabel(generationState.lighting) || lightings[0].value,
        generationState.selectedCategory,
        generationState.perspective,
        generationState.composition,
        generationState.medium,
        generationState.mood,
        generationState.tags
      );

      // Use form builder utility
      const formData = createImageGenerationFormData({
        message: prompt,
        uid,
        model: generationState.model,
        profile,
        uploadedImage: generationState.uploadedImage,
      });

      const result = await generateImage(formData);

      // Handle ActionResult response
      if (!result.success) {
        const errorMessage = result.error || "Failed to generate image";
        toast.error(errorMessage);
        return; // Early return instead of throwing
      }

      const { imageUrl: downloadURL, imageReference = "" } = result.data;

      if (profile.useCredits) {
        await minusCredits(creditsToMinus(generationState.model));
      }

      generationState.updateField("generatedImage", downloadURL);

      if (downloadURL) {
        await saveHistory(
          uid,
          {
            freestyle: generationState.imagePrompt,
            style: generationState.imageStyle,
            lighting:
              getLightingFromLabel(generationState.lighting) ||
              lightings[0].value,
            colorScheme:
              getColorFromLabel(generationState.colorScheme) || colors[0].value,
            imageReference,
            perspective: generationState.perspective,
            composition: generationState.composition,
            medium: generationState.medium,
            mood: generationState.mood,
          },
          prompt,
          downloadURL,
          generationState.model,
          generationState.tags,
          generationState.selectedCategory
        );
      }
    } catch (error: unknown) {
      // Standardized error handling with user feedback
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during image generation";
      
      console.error("Error generating image:", error);
      toast.error(errorMessage);
    } finally {
      generationState.updateField("loading", false);
    }
  };

  return { generate };
};
