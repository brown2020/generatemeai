import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Model } from "@/constants/modelRegistry";

export interface GenerationState {
  imagePrompt: string;
  imageStyle: string;
  model: Model;
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
}

// Separate actions interface for cleaner typing
export interface GenerationActions {
  /** Generic field updater - preferred for new code */
  updateField: <K extends keyof GenerationState>(
    field: K,
    value: GenerationState[K]
  ) => void;
  /** Batch update for multiple fields */
  updateFields: (fields: Partial<GenerationState>) => void;
  /** Set preview state */
  setPreview: (
    type: GenerationState["previewType"],
    value: string | null
  ) => void;
  /** Reset to initial state */
  reset: () => void;
}

export type GenerationStore = GenerationState & GenerationActions;

const initialState: GenerationState = {
  imagePrompt: "",
  imageStyle: "",
  model: "playground-v2",
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

export const useGenerationStore = create<GenerationStore>()(
  devtools(
    (set) => ({
      ...initialState,

      updateField: (field, value) =>
        set({ [field]: value } as Partial<GenerationState>),

      updateFields: (fields) => set(fields),

      setPreview: (previewType, previewValue) =>
        set({ previewType, previewValue }),

      reset: () => set(initialState),
    }),
    { name: "GenerationStore" }
  )
);

// ============================================================================
// Convenience selectors for common field access patterns
// Use these in components instead of accessing store directly
// ============================================================================

/** Select a single field from the store */
export const selectField =
  <K extends keyof GenerationState>(field: K) =>
  (state: GenerationStore) =>
    state[field];

/** Create a setter for a specific field */
export const createFieldSetter =
  <K extends keyof GenerationState>(field: K) =>
  (value: GenerationState[K]) =>
    useGenerationStore.getState().updateField(field, value);

// ============================================================================
// Legacy setter hooks for backward compatibility
// Prefer using updateField directly in new code
// ============================================================================

export const setImagePrompt = (value: string) =>
  useGenerationStore.getState().updateField("imagePrompt", value);

export const setImageStyle = (value: string) =>
  useGenerationStore.getState().updateField("imageStyle", value);

export const setModel = (value: Model) =>
  useGenerationStore.getState().updateField("model", value);

export const setColorScheme = (value: string) =>
  useGenerationStore.getState().updateField("colorScheme", value);

export const setLighting = (value: string) =>
  useGenerationStore.getState().updateField("lighting", value);

export const setPerspective = (value: string) =>
  useGenerationStore.getState().updateField("perspective", value);

export const setComposition = (value: string) =>
  useGenerationStore.getState().updateField("composition", value);

export const setMedium = (value: string) =>
  useGenerationStore.getState().updateField("medium", value);

export const setMood = (value: string) =>
  useGenerationStore.getState().updateField("mood", value);

export const setSelectedCategory = (value: string) =>
  useGenerationStore.getState().updateField("selectedCategory", value);

export const setTags = (value: string[]) =>
  useGenerationStore.getState().updateField("tags", value);

export const setSuggestedTags = (value: string[]) =>
  useGenerationStore.getState().updateField("suggestedTags", value);

export const setGeneratedImage = (value: string) =>
  useGenerationStore.getState().updateField("generatedImage", value);

export const setUploadedImage = (value: File | null) =>
  useGenerationStore.getState().updateField("uploadedImage", value);

export const setLoading = (value: boolean) =>
  useGenerationStore.getState().updateField("loading", value);

export const setIsRecording = (value: boolean) =>
  useGenerationStore.getState().updateField("isRecording", value);

export const setIsOptimizing = (value: boolean) =>
  useGenerationStore.getState().updateField("isOptimizing", value);

export const setShowMarkAsPreview = (value: boolean) =>
  useGenerationStore.getState().updateField("showMarkAsPreview", value);
