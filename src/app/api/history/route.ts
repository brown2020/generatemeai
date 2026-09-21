import type { NextRequest } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";

export const runtime = "nodejs";

const historySchema = z.object({
  id: z.string().min(1).optional(),
  freestyle: z.string(),
  style: z.string(),
  downloadUrl: z.string(),
  model: z.string(),
  prompt: z.string(),
  tags: z.array(z.string()),
  imageCategory: z.string(),
  lighting: z.string(),
  colorScheme: z.string(),
  imageReference: z.string(),
  perspective: z.string(),
  composition: z.string(),
  medium: z.string(),
  mood: z.string(),
});

/**
 * POST /api/history
 * Persists a generation record to the user's covers subcollection.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const params = await parseJsonBody(request, historySchema);
  const { id, ...fields } = params;

  if (id) {
    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, id));
    const snap = await docRef.get();
    if (!snap.exists) {
      return jsonError("Image not found", "NOT_FOUND", 404);
    }
    await docRef.update(fields);
    return jsonOk({ id });
  }

  const collRef = adminDb.collection(FirestorePaths.profileCovers(uid));
  const docRef = collRef.doc();

  await docRef.set({
    ...fields,
    id: docRef.id,
    timestamp: Timestamp.now(),
  });

  return jsonOk({ id: docRef.id });
});
