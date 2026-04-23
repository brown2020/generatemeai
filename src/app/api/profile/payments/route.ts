import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { jsonOk, withAuth } from "@/lib/api/server";

export const runtime = "nodejs";

/**
 * GET /api/profile/payments
 * Lists the authenticated user's payment history, newest first.
 */
export const GET = withAuth(async (uid) => {
  const snap = await adminDb
    .collection(FirestorePaths.userPayments(uid))
    .orderBy("createdAt", "desc")
    .get();

  const payments = snap.docs.map((doc) => ({
    ...doc.data(),
    id: doc.data().id ?? doc.id,
  }));

  return jsonOk(payments as Record<string, unknown>[]);
});
