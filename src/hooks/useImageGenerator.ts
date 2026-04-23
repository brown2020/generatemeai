import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { generatePrompt } from "@/utils/promptUtils";
import { generateImageStream } from "@/actions/generateImage";
import { saveGenerationHistory } from "@/actions/saveHistory";
import { createImageGenerationFormData } from "@/utils/formDataBuilder";
import { colors, getColorFromLabel } from "@/constants/colors";
import { lightings, getLightingFromLabel } from "@/constants/lightings";
import {
  isIOSReactNativeWebView,
  checkRestrictedWords,
} from "@/utils/platform";
import toast from "react-hot-toast";

/**
 * Hook that wires the image-generation UI state to the streaming API route.
 * Progress events from the server update the toast UX so the user sees
 * "Generating…" and "Uploading X/Y" during the long wait.
 */
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

    const progressToastId = toast.loading("Starting generation…");

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

      let result: {
        imageUrl: string;
        imageUrls: string[];
        imageReference?: string;
      } | null = null;
      let errorMessage: string | null = null;

      for await (const event of generateImageStream(formData)) {
        switch (event.status) {
          case "started":
            toast.loading("Preparing request…", { id: progressToastId });
            break;
          case "generating":
            toast.loading("Generating image…", { id: progressToastId });
            break;
          case "uploading":
            toast.loading(
              `Uploading ${event.uploaded}/${event.total}…`,
              { id: progressToastId }
            );
            break;
          case "complete":
            result = event.data;
            break;
          case "error":
            errorMessage = event.error;
            break;
        }
      }

      if (errorMessage || !result) {
        toast.error(errorMessage || "Failed to generate image", {
          id: progressToastId,
        });
        return;
      }

      toast.success("Image ready", { id: progressToastId });

      const {
        imageUrl: downloadURL,
        imageUrls = [],
        imageReference = "",
      } = result;

      await fetchProfile();

      generationState.updateField("generatedImage", downloadURL);
      generationState.updateField("generatedImages", imageUrls);

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
      const errMsg =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during image generation";
      toast.error(errMsg, { id: progressToastId });
    } finally {
      generationState.updateField("loading", false);
    }
  };

  return { generate };
};
