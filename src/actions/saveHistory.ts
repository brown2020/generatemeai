"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { Timestamp } from "firebase-admin/firestore";
import { authenticateAction } from "@/utils/serverAuth";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  AuthenticationError,
} from "@/utils/errors";

interface SaveHistoryParams {
  freestyle: string;
  style: string;
  downloadUrl: string;
  model: string;
  prompt: string;
  tags: string[];
  imageCategory: string;
  lighting: string;
  colorScheme: string;
  imageReference: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
}

/**
 * Saves generation history to Firestore server-side.
 */
export async function saveGenerationHistory(
  params: SaveHistoryParams
): Promise<ActionResult<{ id: string }>> {
  try {
    const uid = await authenticateAction();

    const collRef = adminDb.collection(FirestorePaths.profileCovers(uid));
    const docRef = collRef.doc();

    await docRef.set({
      ...params,
      id: docRef.id,
      timestamp: Timestamp.now(),
    });

    return successResult({ id: docRef.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    console.error("Error saving generation history:", getErrorMessage(error));
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}
