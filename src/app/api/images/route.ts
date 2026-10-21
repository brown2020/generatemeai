import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonOk, withAuth } from "@/lib/api/server";
import { toImageJson } from "@/utils/imageJson";

export const runtime = "nodejs";

/**
 * GET /api/images
 * Lists the authenticated user's gallery, newest first.
 */
export const GET = withAuth(async (uid) => {
  const snap = await adminDb
    .collection(FirestorePaths.profileCovers(uid))
    .orderBy("timestamp", "desc")
    .get();

  return jsonOk(snap.docs.map((doc) => toImageJson(doc.id, doc.data())));
});
