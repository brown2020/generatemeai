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
import {
  type Model,
  isValidModel,
  getModelConfig,
} from "@/constants/modelRegistry";

/**
 * Strategy implementations keyed by strategyKey from MODEL_REGISTRY.
 * Single source of truth for all generation strategies.
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
 * Get strategy by model name - derives from MODEL_REGISTRY.strategyKey.
 * Returns undefined for unsupported models or models without strategies.
 *
 * This is the primary API for strategy lookup. Accepts either a typed Model
 * or a string (for server actions where the model comes from FormData).
 */
export function getStrategy(modelName: string): GenerationStrategy | undefined {
  if (!isValidModel(modelName)) return undefined;
  const config = getModelConfig(modelName as Model);
  return config?.strategyKey
    ? strategyImplementations[config.strategyKey]
    : undefined;
}

/**
 * Checks if a model has a registered strategy.
 */
export function hasStrategy(modelName: string): modelName is Model {
  if (!isValidModel(modelName)) return false;
  const config = getModelConfig(modelName);
  return !!config?.strategyKey && config.strategyKey in strategyImplementations;
}

/**
 * Get strategy by strategy key directly (for internal use).
 */
export function getStrategyByKey(key: string): GenerationStrategy | undefined {
  return strategyImplementations[key];
}
