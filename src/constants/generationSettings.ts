import { colors } from "./colors";
import { lightings } from "./lightings";
import { perspectives } from "./perspectives";
import { compositions } from "./compositions";
import { mediums } from "./mediums";
import { moods } from "./moods";
import { GenerationState } from "@/zustand/useGenerationStore";

/**
 * Configuration for generation settings selectors.
 * Defines the static structure - values come from the store.
 */
export interface GenerationSettingConfig {
  label: string;
  options: { value: string; label: string; id: number }[];
  type: NonNullable<GenerationState["previewType"]>;
  storeKey: keyof GenerationState;
}

/**
 * Static configuration for all generation settings.
 * Used in GenerateImage component to render settings selectors.
 */
export const GENERATION_SETTINGS: GenerationSettingConfig[] = [
  {
    label: "Color Scheme",
    options: colors,
    type: "color",
    storeKey: "colorScheme",
  },
  {
    label: "Lighting",
    options: lightings,
    type: "lighting",
    storeKey: "lighting",
  },
  {
    label: "Perspective",
    options: perspectives,
    type: "perspective",
    storeKey: "perspective",
  },
  {
    label: "Composition",
    options: compositions,
    type: "composition",
    storeKey: "composition",
  },
  {
    label: "Medium",
    options: mediums,
    type: "medium",
    storeKey: "medium",
  },
  {
    label: "Mood",
    options: moods,
    type: "mood",
    storeKey: "mood",
  },
] as const;
