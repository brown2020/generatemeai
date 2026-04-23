import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { FieldValue } from "firebase-admin/firestore";
import { jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";

export const runtime = "nodejs";

const syncSchema = z.object({
  email: z.string().default(""),
  displayName: z.string().default(""),
  photoUrl: z.string().default(""),
  emailVerified: z.boolean().default(false),
});

/**
 * POST /api/auth/sync
 * Syncs auth metadata to the users collection. Silent-on-failure by design —
 * a failed sync must never break the sign-in flow.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  try {
    const details = await parseJsonBody(request, syncSchema);
    await adminDb.doc(FirestorePaths.user(uid)).set(
      {
        ...details,
        lastSignIn: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Intentionally fire-and-forget — don't surface errors to the client.
  }
  return jsonOk<void>(undefined);
});
