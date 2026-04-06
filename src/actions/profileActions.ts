"use server";

import { adminDb, adminAuth } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  AuthenticationError,
} from "@/utils/errors";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Fetches or creates a user profile server-side.
 */
export async function fetchProfileServer(): Promise<
  ActionResult<Record<string, unknown>>
> {
  try {
    const uid = await authenticateAction();
    const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
    const snap = await profileRef.get();

    if (snap.exists) {
      return successResult(snap.data() as Record<string, unknown>);
    }

    // Profile doesn't exist yet — return defaults
    return successResult({ credits: 1000, useCredits: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Updates a user profile server-side.
 */
export async function updateProfileServer(
  updates: Record<string, unknown>
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();
    const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
    await profileRef.set(updates, { merge: true });
    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Deletes a user account server-side: profile, user doc, covers subcollection, 
 * public images, and the Firebase Auth user.
 */
export async function deleteAccountServer(): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    // Delete covers subcollection
    const coversRef = adminDb.collection(FirestorePaths.profileCovers(uid));
    const coversSnap = await coversRef.get();

    const batch = adminDb.batch();
    for (const doc of coversSnap.docs) {
      batch.delete(doc.ref);
      // Also clean up any public copies
      const publicRef = adminDb.doc(FirestorePaths.publicImage(doc.id));
      batch.delete(publicRef);
    }

    // Delete profile and user docs
    batch.delete(adminDb.doc(FirestorePaths.userProfile(uid)));
    batch.delete(adminDb.doc(FirestorePaths.user(uid)));

    // Delete payments subcollection
    const paymentsRef = adminDb.collection(FirestorePaths.userPayments(uid));
    const paymentsSnap = await paymentsRef.get();
    for (const doc of paymentsSnap.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();

    // Delete the Firebase Auth user
    await adminAuth.deleteUser(uid);

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Fetches payment history server-side.
 */
export async function fetchPaymentsServer(): Promise<
  ActionResult<Record<string, unknown>[]>
> {
  try {
    const uid = await authenticateAction();
    const paymentsRef = adminDb.collection(FirestorePaths.userPayments(uid));
    const snap = await paymentsRef.orderBy("createdAt", "desc").get();

    const payments = snap.docs.map((doc: any) => ({
      ...doc.data(),
      id: doc.data().id ?? doc.id,
    }));

    return successResult(payments);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}
