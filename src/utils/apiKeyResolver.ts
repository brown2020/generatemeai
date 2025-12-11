import { model } from "@/types/model";

/**
 * Configuration mapping models to their API key sources.
 */
type ModelApiKeyConfig = {
  envKey: string;
  formDataKey: string;
};

const MODEL_API_KEYS: Record<string, ModelApiKeyConfig> = {
  "dall-e": { envKey: "OPENAI_API_KEY", formDataKey: "openAPIKey" },
  "stable-diffusion-xl": {
    envKey: "FIREWORKS_API_KEY",
    formDataKey: "fireworksAPIKey",
  },
  "playground-v2": {
    envKey: "FIREWORKS_API_KEY",
    formDataKey: "fireworksAPIKey",
  },
  "playground-v2-5": {
    envKey: "FIREWORKS_API_KEY",
    formDataKey: "fireworksAPIKey",
  },
  "stability-sd3-turbo": {
    envKey: "STABILITY_API_KEY",
    formDataKey: "stabilityAPIKey",
  },
  "flux-schnell": {
    envKey: "REPLICATE_API_KEY",
    formDataKey: "replicateAPIKey",
  },
  "ideogram-ai": {
    envKey: "IDEOGRAM_API_KEY",
    formDataKey: "ideogramAPIKey",
  },
  "d-id": { envKey: "DID_API_KEY", formDataKey: "didAPIKey" },
  "runway-ml": { envKey: "RUNWAYML_API_SECRET", formDataKey: "runwayApiKey" },
};

/**
 * Resolves the appropriate API key based on model and payment method.
 *
 * @param modelName - The AI model being used
 * @param useCredits - Whether the user is paying with credits
 * @param userApiKey - The user's own API key (if not using credits)
 * @returns The resolved API key string
 */
export const resolveApiKey = (
  modelName: string,
  useCredits: boolean,
  userApiKey?: string | null
): string => {
  const config = MODEL_API_KEYS[modelName];
  if (!config) return "";

  return useCredits ? process.env[config.envKey] || "" : userApiKey || "";
};

/**
 * Resolves API key from FormData for server actions.
 */
export const resolveApiKeyFromForm = (
  modelName: string,
  useCredits: boolean,
  formData: FormData
): string => {
  const config = MODEL_API_KEYS[modelName];
  if (!config) return "";

  return useCredits
    ? process.env[config.envKey] || ""
    : (formData.get(config.formDataKey) as string) || "";
};

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

export type { ModelApiKeyConfig };
