import { creditsToMinus, getMaxImages } from "@/constants/modelRegistry";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { Transaction } from "firebase-admin/firestore";

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
/**
 * Caps a requested image count at the model's published maximum.
 */
export function boundedImageCount(
  modelName: string,
  imageCount: number | undefined
): number {
  const requested = Number.isFinite(imageCount) ? Math.floor(imageCount as number) : 1;
  const max = getMaxImages(modelName);
  return Math.min(Math.max(requested, 1), max);
}

/**
 * Credits required for one generation: per-image price times the bounded count.
 */
export function generationCreditCost(
  modelName: string,
  imageCount: number | undefined
): number {
  return creditsToMinus(modelName) * boundedImageCount(modelName, imageCount);
}

export const validateCredits = (
  useCredits: boolean,
  credits: number,
  modelName: string,
  imageCount?: number
): CreditValidationResult => {
  if (!useCredits) return { valid: true };

  const required = generationCreditCost(modelName, imageCount);
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
  modelName: string,
  imageCount?: number
): Promise<{ useCredits: boolean; credits: number; imageCount: number; required: number }> => {
  const { useCredits, credits } = await getServerCredits(uid);
  const boundedCount = boundedImageCount(modelName, imageCount);
  const required = generationCreditCost(modelName, imageCount);
  const result = validateCredits(useCredits, credits, modelName, imageCount);
  if (!result.valid) {
    throw new Error(result.error);
  }
  return { useCredits, credits, imageCount: boundedCount, required };
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
  await adminDb.runTransaction(async (tx: Transaction) => {
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
 * Returns credits after a provider or upload failure. The deduction has
 * already committed, so this is a separate transaction.
 */
export async function refundCreditsServer(
  uid: string,
  amount: number
): Promise<void> {
  if (amount <= 0) return;
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  await adminDb.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(profileRef);
    if (!snap.exists) throw new Error("Profile not found");
    const currentCredits = snap.data()?.credits ?? 0;
    tx.update(profileRef, { credits: currentCredits + amount });
  });
}
