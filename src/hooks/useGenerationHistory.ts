import { db } from "@/firebase/firebaseClient";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { PromptDataType } from "@/types/promptdata";
import toast from "react-hot-toast";

/**
 * Hook for saving generation history to Firestore.
 * Returns only the saveHistory function to keep the API minimal.
 */
export const useGenerationHistory = () => {
  const saveHistory = async (
    uid: string,
    promptData: Partial<PromptDataType>,
    prompt: string,
    downloadUrl: string,
    model: string,
    tags: string[],
    category: string
  ): Promise<void> => {
    if (!uid) {
      console.error("User ID is required to save history");
      return;
    }

    try {
      const coll = collection(db, "profiles", uid, "covers");
      const docRef = doc(coll);

      const finalPromptData: PromptDataType = {
        freestyle: promptData.freestyle || "",
        style: promptData.style || "",
        downloadUrl,
        model,
        prompt,
        id: docRef.id,
        timestamp: Timestamp.now(),
        tags,
        imageCategory: category,
        lighting: promptData.lighting || "None",
        colorScheme: promptData.colorScheme || "None",
        imageReference: promptData.imageReference || "",
        perspective: promptData.perspective || "None",
        composition: promptData.composition || "None",
        medium: promptData.medium || "None",
        mood: promptData.mood || "None",
      };

      await setDoc(docRef, finalPromptData);
    } catch (err) {
      console.error("Error saving history:", err);
      toast.error("Failed to save generation history");
    }
  };

  return { saveHistory };
};
