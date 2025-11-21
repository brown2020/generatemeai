import { useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { PromptDataType } from "@/types/promptdata";
import toast from "react-hot-toast";

export const useGenerationHistory = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveHistory = async (
    uid: string,
    promptData: Partial<PromptDataType>,
    prompt: string,
    downloadUrl: string,
    model: string,
    tags: string[],
    category: string
  ) => {
    if (!uid) {
        setError("User ID is required");
        return;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      const coll = collection(db, "profiles", uid, "covers");
      const docRef = doc(coll);

      // Ensure all required fields for PromptDataType are present
      // This is a partial reconstruction based on what's typically available at save time
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
      const msg = err instanceof Error ? err.message : "Failed to save history";
      setError(msg);
      toast.error("Failed to save generation history");
    } finally {
      setIsSaving(false);
    }
  };

  return { saveHistory, isSaving, error };
};

