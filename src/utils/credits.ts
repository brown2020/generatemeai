import { model } from "@/types/model";

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
 * Configuration for credits per model.
 * Maps model names to their environment variable keys and default fallback values.
 */
type CreditsConfig = {
  envVarKey: string;
  fallback: number;
};

const CREDITS_CONFIG: Record<string, CreditsConfig> = {
  "dall-e": { envVarKey: "NEXT_PUBLIC_CREDITS_PER_DALL_E_IMAGE", fallback: 4 },
  "stable-diffusion-xl": {
    envVarKey: "NEXT_PUBLIC_CREDITS_PER_STABLE_DIFFUSION_XL_IMAGE",
    fallback: 4,
  },
  "stability-sd3-turbo": {
    envVarKey: "NEXT_PUBLIC_CREDITS_PER_STABILITY_SD3_TURBO_IMAGE",
    fallback: 4,
  },
  "playground-v2": {
    envVarKey: "NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_IMAGE",
    fallback: 4,
  },
  "playground-v2-5": {
    envVarKey: "NEXT_PUBLIC_CREDITS_PER_PLAYGROUND_V2_5_IMAGE",
    fallback: 4,
  },
  "bria.ai": { envVarKey: "NEXT_PUBLIC_CREDITS_PER_BRIA_IMAGE", fallback: 4 },
  "d-id": { envVarKey: "NEXT_PUBLIC_CREDITS_PER_D_ID", fallback: 50 },
  chatgpt: { envVarKey: "NEXT_PUBLIC_CREDITS_PER_CHATGPT", fallback: 2 },
  "flux-schnell": {
    envVarKey: "NEXT_PUBLIC_CREDITS_PER_FLUX_SCHNELL",
    fallback: 4,
  },
  "runway-ml": { envVarKey: "NEXT_PUBLIC_CREDITS_PER_RUNWAY", fallback: 4 },
  "ideogram-ai": { envVarKey: "NEXT_PUBLIC_CREDITS_PER_IDEOGRAM", fallback: 4 },
};

const DEFAULT_CREDITS = 4;

/**
 * Returns the number of credits to deduct for a given model.
 */
export const creditsToMinus = (modelName: model | string): number => {
  const config = CREDITS_CONFIG[modelName];

  if (!config) {
    return DEFAULT_CREDITS;
  }

  // Access environment variable dynamically
  const envValue = process.env[config.envVarKey];
  return parseEnvVarToNumber(envValue, config.fallback);
};
