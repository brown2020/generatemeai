import { ProfileType } from "@/zustand/useProfileStore";

/**
 * API key field mappings for form data.
 */
const API_KEY_FORM_FIELDS = [
  { formKey: "openAPIKey", profileKey: "openai_api_key" },
  { formKey: "fireworksAPIKey", profileKey: "fireworks_api_key" },
  { formKey: "stabilityAPIKey", profileKey: "stability_api_key" },
  { formKey: "replicateAPIKey", profileKey: "replicate_api_key" },
  { formKey: "ideogramAPIKey", profileKey: "ideogram_api_key" },
] as const;

type ApiKeyProfileKey = (typeof API_KEY_FORM_FIELDS)[number]["profileKey"];

/**
 * Appends all API keys from profile to FormData.
 */
export const appendApiKeysToForm = (
  formData: FormData,
  profile: Pick<ProfileType, ApiKeyProfileKey>
): void => {
  API_KEY_FORM_FIELDS.forEach(({ formKey, profileKey }) => {
    formData.append(formKey, profile[profileKey] || "");
  });
};

/**
 * Appends credit-related fields to FormData.
 */
export const appendCreditsToForm = (
  formData: FormData,
  useCredits: boolean,
  credits: number
): void => {
  formData.append("useCredits", useCredits.toString());
  formData.append("credits", credits.toString());
};

/**
 * Creates FormData for image generation with all required fields.
 */
export const createImageGenerationFormData = (params: {
  message: string;
  uid: string;
  model: string;
  profile: Pick<ProfileType, ApiKeyProfileKey | "useCredits" | "credits">;
  uploadedImage?: File | null;
}): FormData => {
  const { message, uid, model, profile, uploadedImage } = params;
  const formData = new FormData();

  formData.append("message", message);
  formData.append("uid", uid);
  formData.append("model", model);

  appendApiKeysToForm(formData, profile);
  appendCreditsToForm(formData, profile.useCredits, profile.credits);

  if (uploadedImage) {
    formData.append("imageField", uploadedImage);
  }

  return formData;
};
