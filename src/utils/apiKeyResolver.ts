/**
 * API Key utilities - re-exported from centralized registry.
 * @see src/constants/modelRegistry.ts for the single source of truth.
 */
export {
  resolveApiKey,
  resolveApiKeyFromForm,
} from "@/constants/modelRegistry";

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
