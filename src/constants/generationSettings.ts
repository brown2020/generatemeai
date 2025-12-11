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
  setterKey: keyof GenerationState;
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
    setterKey: "setColorScheme",
  },
  {
    label: "Lighting",
    options: lightings,
    type: "lighting",
    storeKey: "lighting",
    setterKey: "setLighting",
  },
  {
    label: "Perspective",
    options: perspectives,
    type: "perspective",
    storeKey: "perspective",
    setterKey: "setPerspective",
  },
  {
    label: "Composition",
    options: compositions,
    type: "composition",
    storeKey: "composition",
    setterKey: "setComposition",
  },
  {
    label: "Medium",
    options: mediums,
    type: "medium",
    storeKey: "medium",
    setterKey: "setMedium",
  },
  {
    label: "Mood",
    options: moods,
    type: "mood",
    storeKey: "mood",
    setterKey: "setMood",
  },
] as const;

/**
 * Get setter function name from store key.
 */
export const getSetterName = (storeKey: string): string => {
  return `set${storeKey.charAt(0).toUpperCase()}${storeKey.slice(1)}`;
};
