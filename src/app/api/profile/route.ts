import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { adminDb, adminAuth } from "@/firebase/firebaseAdmin";
import { PUBLIC_IMAGES_TAG } from "@/constants/cacheTags";
import { FirestorePaths } from "@/firebase/paths";
import {
  jsonOk,
  parseJsonBody,
  withAuth,
} from "@/lib/api/server";
import { ensureUserProfile } from "@/utils/creditValidator";
import { sanitizeProfileUpdate } from "@/utils/profileFields";
import { deleteUserStorage } from "@/utils/storage";

export const runtime = "nodejs";

/**
 * GET /api/profile
 * Fetches (or returns defaults for) the authenticated user's profile.
 */
export const GET = withAuth(async (uid) => {
  const data = await ensureUserProfile(uid);
  return jsonOk(data);
});

const profileUpdateSchema = z.record(z.string(), z.unknown());
const FIRESTORE_BATCH_LIMIT = 400;

/**
 * PATCH /api/profile
 * Merges allowlisted fields into the user's profile document.
 */
export const PATCH = withAuth(async (uid, request: NextRequest) => {
  const updates = await parseJsonBody(request, profileUpdateSchema);
  const sanitized = sanitizeProfileUpdate(updates);
  const profileRef = adminDb.doc(FirestorePaths.userProfile(uid));
  await profileRef.set(sanitized, { merge: true });
  return jsonOk<void>(undefined);
});

/**
 * DELETE /api/profile
 * Deletes the user's profile, covers, public images, payments, and auth user.
 */
export const DELETE = withAuth(async (uid) => {
  const coversSnap = await adminDb
    .collection(FirestorePaths.profileCovers(uid))
    .get();
  const paymentsSnap = await adminDb
    .collection(FirestorePaths.userPayments(uid))
    .get();

  const mediaUrls: string[] = [];
  const refs = [
    adminDb.doc(FirestorePaths.userProfile(uid)),
    adminDb.doc(FirestorePaths.user(uid)),
    adminDb.doc(`users/${uid}/rateLimit/generation`),
  ];

  for (const doc of coversSnap.docs) {
    const data = doc.data();
    for (const field of ["downloadUrl", "videoDownloadUrl", "imageReference"]) {
      const value = data[field];
      if (typeof value === "string" && value) mediaUrls.push(value);
    }
    refs.push(doc.ref);
    refs.push(adminDb.doc(FirestorePaths.publicImage(doc.id)));
  }
  for (const doc of paymentsSnap.docs) {
    refs.push(doc.ref);
  }

  await deleteUserStorage(uid, mediaUrls);

  for (let index = 0; index < refs.length; index += FIRESTORE_BATCH_LIMIT) {
    const batch = adminDb.batch();
    for (const ref of refs.slice(index, index + FIRESTORE_BATCH_LIMIT)) {
      batch.delete(ref);
    }
    await batch.commit();
  }

  revalidateTag(PUBLIC_IMAGES_TAG, { expire: 0 });

  try {
    await adminAuth.deleteUser(uid);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/user-not-found") throw error;
  }

  return jsonOk<void>(undefined);
});
