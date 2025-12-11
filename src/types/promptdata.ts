import { Timestamp } from "firebase/firestore";

/**
 * Data structure for prompt/generation history.
 * Contains all fields needed to recreate a generation.
 */
export interface PromptDataType {
  // Required fields for history
  freestyle: string;
  style: string;
  model: string;
  colorScheme: string;
  lighting: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
  tags: string[];

  // Optional fields
  downloadUrl?: string;
  prompt?: string;
  imageCategory?: string;
  imageReference?: string;
  id?: string;
  timestamp?: Timestamp;
}

/**
 * Partial prompt data for saving history.
 */
export type PartialPromptData = Partial<PromptDataType>;

/**
 * Creates a default prompt data object with required fields.
 */
export const createDefaultPromptData = (
  overrides: Partial<PromptDataType> = {}
): PromptDataType => ({
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
