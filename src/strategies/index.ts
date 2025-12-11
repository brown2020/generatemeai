import { dalleStrategy } from "./dalle";
import {
  fireworksStrategy,
  playgroundV2Strategy,
  playgroundV25Strategy,
} from "./fireworks";
import { stabilityStrategy } from "./stability";
import { replicateStrategy } from "./replicate";
import { ideogramStrategy } from "./ideogram";
import type { GenerationStrategy } from "./types";
import { type Model, isValidModel } from "@/constants/modelRegistry";

/**
 * Strategy key to implementation mapping.
 * These keys match the strategyKey in MODEL_REGISTRY.
 */
const strategyImplementations: Record<string, GenerationStrategy> = {
  dalle: dalleStrategy,
  fireworks: fireworksStrategy,
  stability: stabilityStrategy,
  playgroundV2: playgroundV2Strategy,
  playgroundV25: playgroundV25Strategy,
  replicate: replicateStrategy,
  ideogram: ideogramStrategy,
};

/**
 * Model-to-strategy mapping.
 * Maps model names directly to their generation strategies.
 */
const strategyMap: Partial<Record<Model, GenerationStrategy>> = {
  "dall-e": dalleStrategy,
  "stable-diffusion-xl": fireworksStrategy,
  "stability-sd3-turbo": stabilityStrategy,
  "playground-v2": playgroundV2Strategy,
  "playground-v2-5": playgroundV25Strategy,
  "flux-schnell": replicateStrategy,
  "ideogram-ai": ideogramStrategy,
};

/**
 * Strategy registry - allows string key access for dynamic lookups
 * while maintaining type safety through the underlying map.
 */
export const strategies: Record<string, GenerationStrategy> = strategyMap;

/**
 * Type-safe strategy getter.
 * Returns undefined for unsupported models.
 */
export const getStrategy = (modelName: Model): GenerationStrategy | undefined =>
  strategyMap[modelName];

/**
 * Checks if a model has a registered strategy.
 */
export const hasStrategy = (modelName: string): modelName is Model =>
  isValidModel(modelName) && modelName in strategyMap;

/**
 * Get strategy by strategy key (used by MODEL_REGISTRY).
 */
export const getStrategyByKey = (
  key: string
): GenerationStrategy | undefined => {
  return strategyImplementations[key];
};
