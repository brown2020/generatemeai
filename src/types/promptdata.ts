import { Timestamp } from "firebase/firestore";
import { GenerationParams, createDefaultGenerationParams } from "./generation";

/**
 * Data structure for prompt/generation history.
 * Extends base GenerationParams with metadata and optional video fields.
 */
export interface PromptDataType extends GenerationParams {
  id?: string;
  downloadUrl?: string;
  timestamp?: Timestamp;
  videoDownloadUrl?: string;
  scriptPrompt?: string;
  videoModel?: string;
  audio?: string;
  animation?: string;
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
  ...createDefaultGenerationParams(),
  ...overrides,
});
