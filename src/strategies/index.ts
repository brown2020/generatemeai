import { dalleStrategy } from "./dalle";
import {
  fireworksStrategy,
  playgroundV2Strategy,
  playgroundV25Strategy,
} from "./fireworks";
import { stabilityStrategy } from "./stability";
import { replicateStrategy } from "./replicate";
import { ideogramStrategy } from "./ideogram";
import { GenerationStrategy } from "./types";
import { model } from "@/types/model";

/**
 * Model-to-strategy mapping.
 * Uses Partial<Record<model, GenerationStrategy>> to allow type-safe
 * lookups while supporting a subset of all possible models.
 */
type StrategyMap = Partial<Record<model, GenerationStrategy>>;

const strategyMap: StrategyMap = {
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
export const getStrategy = (modelName: model): GenerationStrategy | undefined =>
  strategyMap[modelName];

/**
 * Checks if a model has a registered strategy.
 */
export const hasStrategy = (modelName: string): modelName is model =>
  modelName in strategyMap;
