import { Timestamp } from "firebase/firestore";
import { model } from "./model";

/**
 * Base generation parameters - shared across all generation-related types.
 * This is the single source of truth for generation parameters.
 */
export interface GenerationParams {
  freestyle: string;
  style: string;
  model: model | string;
  colorScheme: string;
  lighting: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
  tags: string[];
  imageCategory?: string;
  prompt?: string;
  imageReference?: string;
}

/**
 * Creates default generation parameters.
 * Use when initializing forms or resetting state.
 */
export const createDefaultGenerationParams = (
  overrides: Partial<GenerationParams> = {}
): GenerationParams => ({
  freestyle: "",
  style: "",
  model: "",
  colorScheme: "None",
  lighting: "None",
  perspective: "None",
  composition: "None",
  medium: "None",
  mood: "None",
  tags: [],
  ...overrides,
});

/**
 * Type for generation parameter field names.
 */
export type GenerationParamKey = keyof GenerationParams;

/**
 * Partial generation params for updates.
 */
export type PartialGenerationParams = Partial<GenerationParams>;
