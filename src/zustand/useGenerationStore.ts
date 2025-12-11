import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { model } from "@/types/model";

export interface GenerationState {
  imagePrompt: string;
  imageStyle: string;
  model: model;
  colorScheme: string;
  lighting: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
  selectedCategory: string;
  tags: string[];
  suggestedTags: string[];
  generatedImage: string;
  uploadedImage: File | null;

  // UI State
  loading: boolean;
  isRecording: boolean;
  isOptimizing: boolean;
  showMarkAsPreview: boolean;

  // Preview State
  previewType:
    | "model"
    | "color"
    | "lighting"
    | "style"
    | "perspective"
    | "composition"
    | "medium"
    | "mood"
    | null;
  previewValue: string | null;

  // Generic field updater (for less common fields)
  updateField: <K extends keyof GenerationState>(
    field: K,
    value: GenerationState[K]
  ) => void;

  // Batch update for multiple fields
  updateFields: (fields: Partial<GenerationState>) => void;

  // Frequently used setters (kept for convenience)
  setImagePrompt: (prompt: string) => void;
  setImageStyle: (style: string) => void;
  setModel: (model: model) => void;
  setColorScheme: (color: string) => void;
  setLighting: (lighting: string) => void;
  setPerspective: (perspective: string) => void;
  setComposition: (composition: string) => void;
  setMedium: (medium: string) => void;
  setMood: (mood: string) => void;
  setSelectedCategory: (category: string) => void;
  setTags: (tags: string[]) => void;
  setSuggestedTags: (tags: string[]) => void;
  setGeneratedImage: (url: string) => void;
  setUploadedImage: (file: File | null) => void;
  setLoading: (loading: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsOptimizing: (isOptimizing: boolean) => void;
  setShowMarkAsPreview: (show: boolean) => void;
  setPreview: (
    type: GenerationState["previewType"],
    value: string | null
  ) => void;
  reset: () => void;
}

const initialState = {
  imagePrompt: "",
  imageStyle: "",
  model: "playground-v2" as model,
  colorScheme: "None",
  lighting: "None",
  perspective: "None",
  composition: "None",
  medium: "None",
  mood: "None",
  selectedCategory: "",
  tags: [],
  suggestedTags: [],
  generatedImage: "",
  uploadedImage: null,
  loading: false,
  isRecording: false,
  isOptimizing: false,
  showMarkAsPreview: false,
  previewType: null,
  previewValue: null,
};

export const useGenerationStore = create<GenerationState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Generic field updater
      updateField: (field, value) =>
        set({ [field]: value } as Partial<GenerationState>),

      // Batch update
      updateFields: (fields) => set(fields),

      // Individual setters (kept for convenience and backward compatibility)
      setImagePrompt: (imagePrompt) => set({ imagePrompt }),
      setImageStyle: (imageStyle) => set({ imageStyle }),
      setModel: (model) => set({ model }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLighting: (lighting) => set({ lighting }),
      setPerspective: (perspective) => set({ perspective }),
      setComposition: (composition) => set({ composition }),
      setMedium: (medium) => set({ medium }),
      setMood: (mood) => set({ mood }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setTags: (tags) => set({ tags }),
      setSuggestedTags: (suggestedTags) => set({ suggestedTags }),
      setGeneratedImage: (generatedImage) => set({ generatedImage }),
      setUploadedImage: (uploadedImage) => set({ uploadedImage }),
      setLoading: (loading) => set({ loading }),
      setIsRecording: (isRecording) => set({ isRecording }),
      setIsOptimizing: (isOptimizing) => set({ isOptimizing }),
      setShowMarkAsPreview: (showMarkAsPreview) => set({ showMarkAsPreview }),
      setPreview: (previewType, previewValue) =>
        set({ previewType, previewValue }),
      reset: () => set(initialState),
    }),
    { name: "GenerationStore" }
  )
);
