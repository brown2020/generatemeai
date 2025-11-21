import { useState } from "react";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useGenerationHistory } from "@/hooks/useGenerationHistory";
import { generatePrompt } from "@/utils/promptUtils";
import { generateImage } from "@/actions/generateImage";
import { creditsToMinus } from "@/utils/credits";
import {
  colors,
  getColorFromLabel,
} from "@/constants/colors";
import {
  lightings,
  getLightingFromLabel,
} from "@/constants/lightings";
import { isIOSReactNativeWebView, checkRestrictedWords } from "@/utils/platform";
import toast from "react-hot-toast";

export const useImageGenerator = () => {
  const uid = useAuthStore((s) => s.uid);
  
  // Profile Store
  const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key);
  const replicateAPIKey = useProfileStore((s) => s.profile.replicate_api_key);
  const ideogramAPIKey = useProfileStore((s) => s.profile.ideogram_api_key);
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
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

      const formData = new FormData();
      formData.append("message", prompt);
      formData.append("uid", uid);
      formData.append("openAPIKey", openAPIKey);
      formData.append("fireworksAPIKey", fireworksAPIKey);
      formData.append("stabilityAPIKey", stabilityAPIKey);
      formData.append("replicateAPIKey", replicateAPIKey);
      formData.append("ideogramAPIKey", ideogramAPIKey);
      formData.append("useCredits", useCredits.toString());
      formData.append("credits", credits.toString());
      formData.append("model", model);
      if (uploadedImage) {
        formData.append("imageField", uploadedImage);
      }
      
      const result = await generateImage(formData);

      if (!result || result.error) {
        toast.error(
          `Failed to generate image: ${result?.error || "Unknown error"}`
        );
        throw new Error("Failed to generate image.");
      }

      const downloadURL = result.imageUrl || "";
      const imageReference = result.imageReference || "";

      if (useCredits) {
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
            perspective: perspective,
            composition: composition,
            medium: medium,
            mood: mood,
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

