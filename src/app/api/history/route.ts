import type { NextRequest } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";

export const runtime = "nodejs";

const historySchema = z.object({
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

  const collRef = adminDb.collection(FirestorePaths.profileCovers(uid));
  const docRef = collRef.doc();

  await docRef.set({
    ...params,
    id: docRef.id,
    timestamp: Timestamp.now(),
  });

  return jsonOk({ id: docRef.id });
});
