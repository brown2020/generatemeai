import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { Transaction } from "firebase-admin/firestore";
import { boundedImageCount, generationCreditCost, STARTING_CREDITS } from "@/utils/creditCost";
import { InsufficientCreditsError } from "@/utils/errors";

export { boundedImageCount, generationCreditCost };

/**
 * Result of credit validation.
 */
export type CreditValidationResult =
  | { valid: true }
  | { valid: false; error: string; required: number; available: number };

/**
 * Validates if user has enough credits for an operation.
 */
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
/**
 * Creates the profile with the starting balance when it is missing.
 * Later reads return the stored balance, including zero.
 */
export async function ensureUserProfile(
  uid: string
): Promise<Record<string, unknown>> {
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  return adminDb.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(profileRef);
    if (snap.exists) return snap.data() ?? {};
    const created = { credits: STARTING_CREDITS, useCredits: true };
    tx.set(profileRef, created);
    return created;
  });
}

export async function getServerCredits(
  uid: string
): Promise<{ useCredits: boolean; credits: number }> {
  const data = await ensureUserProfile(uid);
  return {
    useCredits: data.useCredits !== false,
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
    throw new InsufficientCreditsError(result.error);
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
      throw new InsufficientCreditsError(
        `Not enough credits. Required: ${amount}, Available: ${currentCredits}. Please purchase credits or use your own API keys.`
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
