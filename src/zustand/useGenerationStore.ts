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
