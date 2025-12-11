/**
 * Unified Model Registry - Single source of truth for all model configurations.
 * Consolidates: types/model.ts, constants/models.ts, utils/credits.ts,
 * utils/apiKeyResolver.ts, and strategies/index.ts
 */

import type { GenerationStrategy } from "@/strategies/types";

/**
 * Model capability flags.
 */
export interface ModelCapabilities {
  hasAudio: boolean;
  hasSilentAnimation: boolean;
  hasAnimationType: boolean;
  hasScriptPromptVideoGen: boolean;
  supportsImageUpload: boolean;
}

/**
 * Credit configuration for a model.
 */
export interface CreditConfig {
  envKey: string;
  fallback: number;
}

/**
 * API key configuration for a model.
 */
export interface ApiKeyConfig {
  envKey: string;
  formDataKey: string;
}

/**
 * Complete model configuration.
 */
export interface ModelConfig {
  id: number;
  value: string;
  label: string;
  type: "image" | "video" | "both" | "utility";
  credits: CreditConfig;
  apiKey: ApiKeyConfig;
  capabilities: ModelCapabilities;
  /** Strategy is loaded lazily to avoid circular dependencies */
  strategyKey?: string;
}

/**
 * Default capabilities for image-only models.
 */
const IMAGE_ONLY_CAPABILITIES: ModelCapabilities = {
  hasAudio: false,
  hasSilentAnimation: false,
  hasAnimationType: false,
  hasScriptPromptVideoGen: false,
  supportsImageUpload: true,
};

/**
 * Default capabilities for models that don't support image upload.
 */
const NO_UPLOAD_CAPABILITIES: ModelCapabilities = {
  ...IMAGE_ONLY_CAPABILITIES,
  supportsImageUpload: false,
};

/**
 * Complete model registry - THE single source of truth.
 */
export const MODEL_REGISTRY = {
  "dall-e": {
    id: 1,
    value: "dall-e",
    label: "DALL-E (OpenAI)",
    type: "image",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE", fallback: 4 },
    apiKey: { envKey: "OPENAI_API_KEY", formDataKey: "openAPIKey" },
    capabilities: NO_UPLOAD_CAPABILITIES,
    strategyKey: "dalle",
  },
  "stable-diffusion-xl": {
    id: 2,
    value: "stable-diffusion-xl",
    label: "Stable Diffusion-XL",
    type: "image",
    credits: {
      envKey: "NEXT_PUBLIC_CREDITS_PER_STABLE_DIFFUSION_XL_IMAGE",
      fallback: 4,
    },
    apiKey: { envKey: "FIREWORKS_API_KEY", formDataKey: "fireworksAPIKey" },
    capabilities: IMAGE_ONLY_CAPABILITIES,
    strategyKey: "fireworks",
  },
  "stability-sd3-turbo": {
    id: 3,
    value: "stability-sd3-turbo",
    label: "Stability SD3-turbo",
    type: "image",
    credits: {
      envKey: "NEXT_PUBLIC_CREDITS_PER_STABILITY_SD3_TURBO_IMAGE",
      fallback: 4,
    },
    apiKey: { envKey: "STABILITY_API_KEY", formDataKey: "stabilityAPIKey" },
    capabilities: IMAGE_ONLY_CAPABILITIES,
    strategyKey: "stability",
  },
  "playground-v2": {
    id: 4,
    value: "playground-v2",
    label: "Playground V2",
    type: "image",
    credits: {
      envKey: "NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_IMAGE",
      fallback: 4,
    },
    apiKey: { envKey: "FIREWORKS_API_KEY", formDataKey: "fireworksAPIKey" },
    capabilities: IMAGE_ONLY_CAPABILITIES,
    strategyKey: "playgroundV2",
  },
  "playground-v2-5": {
    id: 5,
    value: "playground-v2-5",
    label: "Playground V2-5 (1024px Aesthetic)",
    type: "image",
    credits: {
      envKey: "NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_5_IMAGE",
      fallback: 4,
    },
    apiKey: { envKey: "FIREWORKS_API_KEY", formDataKey: "fireworksAPIKey" },
    capabilities: IMAGE_ONLY_CAPABILITIES,
    strategyKey: "playgroundV25",
  },
  "flux-schnell": {
    id: 6,
    value: "flux-schnell",
    label: "Flux Schnell (Blackforest Labs)",
    type: "image",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_FLUX_SCHNELL", fallback: 4 },
    apiKey: { envKey: "REPLICATE_API_KEY", formDataKey: "replicateAPIKey" },
    capabilities: NO_UPLOAD_CAPABILITIES,
    strategyKey: "replicate",
  },
  "ideogram-ai": {
    id: 9,
    value: "ideogram-ai",
    label: "Ideogram AI",
    type: "image",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_IDEOGRAM", fallback: 4 },
    apiKey: { envKey: "IDEOGRAM_API_KEY", formDataKey: "ideogramAPIKey" },
    capabilities: NO_UPLOAD_CAPABILITIES,
    strategyKey: "ideogram",
  },
  "d-id": {
    id: 7,
    value: "d-id",
    label: "D-ID",
    type: "video",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_D_ID", fallback: 50 },
    apiKey: { envKey: "DID_API_KEY", formDataKey: "didAPIKey" },
    capabilities: {
      hasAudio: true,
      hasSilentAnimation: true,
      hasAnimationType: true,
      hasScriptPromptVideoGen: true,
      supportsImageUpload: false,
    },
  },
  "runway-ml": {
    id: 8,
    value: "runway-ml",
    label: "RunwayML",
    type: "video",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_RUNWAY", fallback: 4 },
    apiKey: { envKey: "RUNWAYML_API_SECRET", formDataKey: "runwayApiKey" },
    capabilities: {
      hasAudio: false,
      hasSilentAnimation: true,
      hasAnimationType: false,
      hasScriptPromptVideoGen: false,
      supportsImageUpload: false,
    },
  },
  // Utility models (not shown in UI but used for credits)
  "bria.ai": {
    id: 10,
    value: "bria.ai",
    label: "Bria AI",
    type: "utility",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_BRIA_IMAGE", fallback: 4 },
    apiKey: { envKey: "BRIA_AI_API_KEY", formDataKey: "briaApiKey" },
    capabilities: NO_UPLOAD_CAPABILITIES,
  },
  chatgpt: {
    id: 11,
    value: "chatgpt",
    label: "ChatGPT",
    type: "utility",
    credits: { envKey: "NEXT_PUBLIC_CREDITS_PER_CHATGPT", fallback: 2 },
    apiKey: { envKey: "OPENAI_API_KEY", formDataKey: "openAPIKey" },
    capabilities: NO_UPLOAD_CAPABILITIES,
  },
} as const satisfies Record<string, ModelConfig>;

/**
 * Model type derived from registry keys.
 */
export type Model = keyof typeof MODEL_REGISTRY;

/**
 * Type guard to check if a string is a valid model.
 */
export const isValidModel = (value: string): value is Model => {
  return value in MODEL_REGISTRY;
};

/**
 * Get model configuration by name.
 */
export const getModelConfig = (modelName: string): ModelConfig | undefined => {
  return MODEL_REGISTRY[modelName as Model];
};

/**
 * Get all models as an array (for select dropdowns).
 */
export const getModelsArray = (): ModelConfig[] => {
  return Object.values(MODEL_REGISTRY);
};

/**
 * Get models filtered by type.
 */
export const getModelsByType = (
  type: ModelConfig["type"] | ModelConfig["type"][]
): ModelConfig[] => {
  const types = Array.isArray(type) ? type : [type];
  return getModelsArray().filter((m) => types.includes(m.type));
};

/**
 * Get image generation models (for UI).
 */
export const getImageModels = (): ModelConfig[] => {
  return getModelsByType(["image", "both"]);
};

/**
 * Get video generation models (for UI).
 */
export const getVideoModels = (): ModelConfig[] => {
  return getModelsByType(["video", "both"]);
};

// ============================================================================
// Credit utilities (formerly in utils/credits.ts)
// ============================================================================

const DEFAULT_CREDITS = 4;

/**
 * Parses an environment variable to a number with a fallback value.
 */
const parseEnvVarToNumber = (
  envVar: string | undefined,
  fallback: number
): number => {
  return envVar ? parseInt(envVar, 10) : fallback;
};

/**
 * Returns the number of credits to deduct for a given model.
 */
export const creditsToMinus = (modelName: string): number => {
  const config = getModelConfig(modelName);
  if (!config) return DEFAULT_CREDITS;

  const envValue = process.env[config.credits.envKey];
  return parseEnvVarToNumber(envValue, config.credits.fallback);
};

// ============================================================================
// API Key utilities (formerly in utils/apiKeyResolver.ts)
// ============================================================================

/**
 * Resolves the appropriate API key based on model and payment method.
 */
export const resolveApiKey = (
  modelName: string,
  useCredits: boolean,
  userApiKey?: string | null
): string => {
  const config = getModelConfig(modelName);
  if (!config) return "";

  return useCredits
    ? process.env[config.apiKey.envKey] || ""
    : userApiKey || "";
};

/**
 * Resolves API key from FormData for server actions.
 */
export const resolveApiKeyFromForm = (
  modelName: string,
  useCredits: boolean,
  formData: FormData
): string => {
  const config = getModelConfig(modelName);
  if (!config) return "";

  return useCredits
    ? process.env[config.apiKey.envKey] || ""
    : (formData.get(config.apiKey.formDataKey) as string) || "";
};

/**
 * Check if a model supports image upload.
 */
export const supportsImageUpload = (modelName: string): boolean => {
  const config = getModelConfig(modelName);
  return config?.capabilities.supportsImageUpload ?? false;
};

// ============================================================================
// FormData utilities for server actions
// ============================================================================

/**
 * Gets all API keys from FormData for server actions.
 */
export const extractApiKeysFromForm = (formData: FormData) => ({
  openAPIKey: formData.get("openAPIKey") as string | null,
  fireworksAPIKey: formData.get("fireworksAPIKey") as string | null,
  stabilityAPIKey: formData.get("stabilityAPIKey") as string | null,
  replicateAPIKey: formData.get("replicateAPIKey") as string | null,
  ideogramAPIKey: formData.get("ideogramAPIKey") as string | null,
  didAPIKey: formData.get("didAPIKey") as string | null,
  runwayApiKey: formData.get("runwayApiKey") as string | null,
});

// ============================================================================
// Legacy exports for backward compatibility
// These are used across the codebase - keep until full migration
// ============================================================================

/** Alias for ModelConfig - used in some components */
export type SelectModel = ModelConfig;

/** Array of user-facing models (excludes utility models) */
export const models = getModelsArray().filter((m) => m.type !== "utility");

/** Alias for getModelConfig - used in some components */
export const findModelByValue = (
  searchValue: string
): ModelConfig | undefined => getModelConfig(searchValue);
