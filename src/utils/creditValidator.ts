import { creditsToMinus } from "@/constants/modelRegistry";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";

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
 * Reads the user's credit balance and useCredits flag from Firestore (server-side).
 * This prevents clients from forging credit values in FormData.
 */
export async function getServerCredits(
  uid: string
): Promise<{ useCredits: boolean; credits: number }> {
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  const snap = await profileRef.get();
  if (!snap.exists) {
    return { useCredits: true, credits: 0 };
  }
  const data = snap.data()!;
  return {
    useCredits: data.useCredits ?? true,
    credits: typeof data.credits === "number" ? data.credits : 0,
  };
}

/**
 * Server-side credit validation that reads from Firestore instead of trusting client data.
 * Throws an error if credits are insufficient.
 */
export const assertSufficientCreditsServer = async (
  uid: string,
  modelName: string
): Promise<{ useCredits: boolean; credits: number }> => {
  const { useCredits, credits } = await getServerCredits(uid);
  const result = validateCredits(useCredits, credits, modelName);
  if (!result.valid) {
    throw new Error(result.error);
  }
  return { useCredits, credits };
};

/**
 * Atomically deducts credits server-side using Firebase Admin.
 * Uses a transaction to prevent race conditions.
 */
export async function deductCreditsServer(
  uid: string,
  amount: number
): Promise<void> {
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  await adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(profileRef);
    if (!snap.exists) throw new Error("Profile not found");
    const currentCredits = snap.data()?.credits ?? 0;
    if (currentCredits < amount) {
      throw new Error(
        `Insufficient credits. Required: ${amount}, Available: ${currentCredits}`
      );
    }
    tx.update(profileRef, { credits: currentCredits - amount });
  });
}

/**
 * Throws an error if credits are insufficient (legacy client-trusted version).
 * @deprecated Use assertSufficientCreditsServer for server actions.
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
