import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useGenerationHistory } from "@/hooks/useGenerationHistory";
import { generatePrompt } from "@/utils/promptUtils";
import { generateImage } from "@/actions/generateImage";
import { creditsToMinus } from "@/utils/credits";
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
  const minusCredits = useProfileStore((state) => state.minusCredits);

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
    uploadedImage,
    setLoading,
    setGeneratedImage,
  } = useGenerationStore();

  const { saveHistory } = useGenerationHistory();

  const isPromptValid = !!imagePrompt.trim();
  const isModelValid = !!model;

  const generate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isPromptValid || !isModelValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (isIOSReactNativeWebView() && checkRestrictedWords(imagePrompt)) {
      toast.error(
        "Your description contains restricted words and cannot be used."
      );
      return;
    }

    try {
      setLoading(true);

      const prompt: string = generatePrompt(
        imagePrompt,
        imageStyle,
        getColorFromLabel(colorScheme) || colors[0].value,
        getLightingFromLabel(lighting) || lightings[0].value,
        selectedCategory,
        perspective,
        composition,
        medium,
        mood,
        tags
      );

      // Use form builder utility
      const formData = createImageGenerationFormData({
        message: prompt,
        uid,
        model,
        profile,
        uploadedImage,
      });

      const result = await generateImage(formData);

      // Handle ActionResult response
      if (!result.success) {
        toast.error(`Failed to generate image: ${result.error}`);
        throw new Error(result.error);
      }

      const { imageUrl: downloadURL, imageReference = "" } = result.data;

      if (profile.useCredits) {
        await minusCredits(creditsToMinus(model));
      }

      setGeneratedImage(downloadURL);

      if (downloadURL) {
        await saveHistory(
          uid,
          {
            freestyle: imagePrompt,
            style: imageStyle,
            lighting: getLightingFromLabel(lighting) || lightings[0].value,
            colorScheme: getColorFromLabel(colorScheme) || colors[0].value,
            imageReference,
            perspective,
            composition,
            medium,
            mood,
          },
          prompt,
          downloadURL,
          model,
          tags,
          selectedCategory
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error generating image:", error.message);
      } else {
        console.error("An unknown error occurred during image generation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { generate };
};
