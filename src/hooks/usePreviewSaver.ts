import { useGenerationStore, GenerationState } from "@/zustand/useGenerationStore";
import { artStyles } from "@/constants/artStyles";
import { normalizeValue } from "@/utils/imageUtils";
import { getPerspectiveFromLabel } from "@/constants/perspectives";
import { getCompositionFromLabel } from "@/constants/compositions";
import { getMediumFromLabel } from "@/constants/mediums";
import { getMoodFromLabel } from "@/constants/moods";
import toast from "react-hot-toast";

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

  const saveAsPreview = async (
    type:
      | "model"
      | "color"
      | "lighting"
      | "style"
      | "perspective"
      | "composition"
      | "medium"
      | "mood"
  ) => {
    if (!generatedImage) return;

    let value = "";
    switch (type) {
      case "model":
        value = model;
        break;
      case "color":
        if (colorScheme === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = colorScheme;
        break;
      case "lighting":
        if (lighting === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = lighting;
        break;
      case "style":
        const styleObj = artStyles.find((s) => s.label === imageStyle);
        value = styleObj
          ? normalizeValue(styleObj.value)
          : normalizeValue(imageStyle);
        break;
      case "perspective":
        if (perspective === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getPerspectiveFromLabel(perspective);
        break;
      case "composition":
        if (composition === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getCompositionFromLabel(composition);
        break;
      case "medium":
        if (medium === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMediumFromLabel(medium);
        break;
      case "mood":
        if (mood === "None") {
          toast.error("Cannot save 'None' as a preview");
          return;
        }
        value = getMoodFromLabel(mood);
        break;
    }

    if (!value) {
      toast.error(`Please select a ${type} first`);
      return;
    }

    try {
      const loadingToast = toast.loading("Saving preview...");

      const response = await fetch("/api/previews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          type: `${type}s`,
          value: value,
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
  };

  return { saveAsPreview };
};

