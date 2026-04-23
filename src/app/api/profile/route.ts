import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb, adminAuth } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import {
  jsonOk,
  parseJsonBody,
  withAuth,
} from "@/lib/api/server";

export const runtime = "nodejs";

/**
 * GET /api/profile
 * Fetches (or returns defaults for) the authenticated user's profile.
 */
export const GET = withAuth(async (uid) => {
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  const snap = await profileRef.get();

  const data = snap.exists
    ? (snap.data() as Record<string, unknown>)
    : { credits: 1000, useCredits: true };

  return jsonOk(data);
});

const profileUpdateSchema = z.record(z.string(), z.unknown());

/**
 * PATCH /api/profile
 * Merges provided fields into the user's profile document.
 */
export const PATCH = withAuth(async (uid, request: NextRequest) => {
  const updates = await parseJsonBody(request, profileUpdateSchema);
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  await profileRef.set(updates, { merge: true });
  return jsonOk<void>(undefined);
});

/**
 * DELETE /api/profile
 * Deletes the user's profile, covers, public images, payments, and auth user.
 */
export const DELETE = withAuth(async (uid) => {
  const batch = adminDb.batch();

  const coversSnap = await adminDb
    .collection(FirestorePaths.profileCovers(uid))
    .get();
  for (const doc of coversSnap.docs) {
    batch.delete(doc.ref);
    batch.delete(adminDb.doc(FirestorePaths.publicImage(doc.id)));
  }

  batch.delete(adminDb.doc(FirestorePaths.userProfile(uid)));
  batch.delete(adminDb.doc(FirestorePaths.user(uid)));

  const paymentsSnap = await adminDb
    .collection(FirestorePaths.userPayments(uid))
    .get();
  for (const doc of paymentsSnap.docs) {
    batch.delete(doc.ref);
  }

  await batch.commit();
  await adminAuth.deleteUser(uid);

  return jsonOk<void>(undefined);
});
