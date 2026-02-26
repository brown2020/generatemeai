"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { FieldValue } from "firebase-admin/firestore";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Syncs auth details to the users collection server-side.
 * Called after sign-in to keep user record up-to-date.
 */
export async function syncAuthToFirestoreServer(details: {
  email: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
}): Promise<void> {
  try {
    const uid = await authenticateAction();
    const userRef = adminDb.doc(FirestorePaths.user(uid));
    await userRef.set(
      {
        ...details,
        lastSignIn: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Fire-and-forget — don't break the auth flow
  }
}
