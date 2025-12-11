import { creditsToMinus } from "@/constants/modelRegistry";

/**
 * Result of credit validation.
 */
export type CreditValidationResult =
  | { valid: true }
  | { valid: false; error: string; required: number; available: number };

/**
 * Validates if user has enough credits for an operation.
 *
 * @param useCredits - Whether the user is paying with credits
 * @param credits - Current credit balance
 * @param modelName - The model being used
 * @returns Validation result with error details if invalid
 */
export const validateCredits = (
  useCredits: boolean,
  credits: number,
  modelName: string
): CreditValidationResult => {
  if (!useCredits) return { valid: true };

  const required = creditsToMinus(modelName);
  if (credits < required) {
    return {
      valid: false,
      error: `Not enough credits. Required: ${required}, Available: ${credits}. Please purchase credits or use your own API keys.`,
      required,
      available: credits,
    };
  }
  return { valid: true };
};

/**
 * Validates credits from FormData (for server actions).
 */
export const validateCreditsFromForm = (
  formData: FormData,
  modelName: string
): CreditValidationResult => {
  const useCredits = formData.get("useCredits") === "true";
  const credits = Number(formData.get("credits") || 0);

  return validateCredits(useCredits, credits, modelName);
};

/**
 * Throws an error if credits are insufficient.
 */
export const assertSufficientCredits = (
  useCredits: boolean,
  credits: number,
  modelName: string
): void => {
  const result = validateCredits(useCredits, credits, modelName);
  if (!result.valid) {
    throw new Error(result.error);
  }
};
