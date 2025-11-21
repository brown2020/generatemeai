import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGenerationStore } from "@/zustand/useGenerationStore";
import { colors } from "@/constants/colors";
import { lightings } from "@/constants/lightings";
import { model } from "@/types/model";

export const useUrlSync = () => {
  const searchterm = useSearchParams();
  const {
    setImagePrompt,
    setImageStyle,
    setModel,
    setColorScheme,
    setLighting,
    setTags,
    setSelectedCategory,
    setPerspective,
    setComposition,
    setMedium,
    setMood,
    setUploadedImage,
  } = useGenerationStore();

  useEffect(() => {
    const freestyleSearchParam = searchterm.get("freestyle");
    const styleSearchParam = searchterm.get("style");
    const modelSearchParam = searchterm.get("model");
    const colorSearchParam = searchterm.get("color");
    const lightingSearchParam = searchterm.get("lighting");
    const tagsSearchParam = searchterm.get("tags")?.split(",").filter(Boolean);
    const imageReferenceSearchParam = searchterm.get("imageReference");
    const imageCategorySearchParam = searchterm.get("imageCategory");
    const perspectiveSearchParam = searchterm.get("perspective");
    const compositionSearchParam = searchterm.get("composition");
    const mediumSearchParam = searchterm.get("medium");
    const moodSearchParam = searchterm.get("mood");

    if (freestyleSearchParam) setImagePrompt(freestyleSearchParam);
    if (styleSearchParam) setImageStyle(styleSearchParam);
    if (modelSearchParam) setModel(modelSearchParam as model);

    if (colorSearchParam) {
      const colorOption = colors.find((c) => c.value === colorSearchParam);
      if (colorOption) setColorScheme(colorOption.label);
      else {
        const colorByLabel = colors.find(
          (c) => c.label.toLowerCase() === colorSearchParam.toLowerCase()
        );
        if (colorByLabel) setColorScheme(colorByLabel.label);
      }
    }

    if (lightingSearchParam) {
      const lightingOption = lightings.find(
        (l) => l.value === lightingSearchParam
      );
      if (lightingOption) setLighting(lightingOption.label);
      else {
        const lightingByLabel = lightings.find(
          (l) => l.label.toLowerCase() === lightingSearchParam.toLowerCase()
        );
        if (lightingByLabel) setLighting(lightingByLabel.label);
      }
    }

    if (tagsSearchParam) setTags(tagsSearchParam);
    if (imageCategorySearchParam) setSelectedCategory(imageCategorySearchParam);
    if (perspectiveSearchParam) setPerspective(perspectiveSearchParam);
    if (compositionSearchParam) setComposition(compositionSearchParam);
    if (mediumSearchParam) setMedium(mediumSearchParam);
    if (moodSearchParam) setMood(moodSearchParam);

    if (imageReferenceSearchParam) {
      const loadImageFromUrl = async (url: string) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], "default-image.jpg", {
            type: blob.type,
          });
          setUploadedImage(file);
        } catch (error) {
          console.error("Failed to load image from URL:", error);
        }
      };
      loadImageFromUrl(imageReferenceSearchParam);
    }
  }, [
    searchterm,
    setImagePrompt,
    setImageStyle,
    setModel,
    setColorScheme,
    setLighting,
    setTags,
    setSelectedCategory,
    setPerspective,
    setComposition,
    setMedium,
    setMood,
    setUploadedImage,
  ]);
};

