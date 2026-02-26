import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { generatePrompt } from "@/utils/promptUtils";
import { generateImage } from "@/actions/generateImage";
import { saveGenerationHistory } from "@/actions/saveHistory";
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
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const generationState = useGenerationStore(
    useShallow((s) => ({
      imagePrompt: s.imagePrompt,
      negativePrompt: s.negativePrompt,
      imageStyle: s.imageStyle,
      model: s.model,
      aspectRatio: s.aspectRatio,
      imageCount: s.imageCount,
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

      const formData = createImageGenerationFormData({
        message: prompt,
        uid,
        model: generationState.model,
        profile,
        uploadedImage: generationState.uploadedImage,
        aspectRatio: generationState.aspectRatio,
        negativePrompt: generationState.negativePrompt || undefined,
        imageCount: generationState.imageCount,
      });

      const result = await generateImage(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to generate image");
        return;
      }

      const { imageUrl: downloadURL, imageUrls = [], imageReference = "" } = result.data;

      // Credits are deducted server-side in generateImage — refresh local state
      await fetchProfile();

      generationState.updateField("generatedImage", downloadURL);
      generationState.updateField("generatedImages", imageUrls);

      // Save history server-side
      if (downloadURL) {
        await saveGenerationHistory({
          freestyle: generationState.imagePrompt,
          style: generationState.imageStyle,
          downloadUrl: downloadURL,
          model: generationState.model,
          prompt,
          tags: generationState.tags,
          imageCategory: generationState.selectedCategory,
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
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during image generation";
      toast.error(errorMessage);
    } finally {
      generationState.updateField("loading", false);
    }
  };

  return { generate };
};
