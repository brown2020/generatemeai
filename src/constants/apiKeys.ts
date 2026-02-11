import { ProfileType } from "@/zustand/useProfileStore";

/**
 * Configuration for API key fields displayed in the Profile page.
 */
export interface ApiKeyConfig {
  key: keyof ProfileType;
  label: string;
  placeholder?: string;
}

/**
 * List of API key configurations for the Profile page.
 */
export const API_KEY_CONFIGS: ApiKeyConfig[] = [
  { key: "openai_api_key", label: "OpenAI API Key" },
  { key: "fireworks_api_key", label: "Fireworks API Key" },
  { key: "stability_api_key", label: "Stability API Key" },
  { key: "replicate_api_key", label: "Replicate API Key" },
  { key: "ideogram_api_key", label: "Ideogram API Key" },
  { key: "bria_api_key", label: "Bria API Key" },
  { key: "did_api_key", label: "D-ID API Key" },
  { key: "runway_ml_api_key", label: "Runway ML API Key" },
];

/**
 * Get the API key value from profile by key name.
 */
export const getApiKeyValue = (
  profile: ProfileType,
  key: keyof ProfileType
): string => {
  const value = profile[key];
  return typeof value === "string" ? value : "";
};
