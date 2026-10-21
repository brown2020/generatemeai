import type { NextRequest } from "next/server";
import { z } from "zod";
import { type Transaction } from "firebase-admin/firestore";
import { revalidateTag } from "next/cache";
import { PUBLIC_IMAGES_TAG } from "@/constants/cacheTags";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import {
  errorToResponse,
  jsonError,
  jsonOk,
  parseJsonBody,
} from "@/lib/api/server";
import { authenticateAction } from "@/utils/serverAuth";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ imageId: string }>;
}

const bodySchema = z.object({
  password: z.string().default(""),
});

/**
 * POST /api/images/:imageId/share
 * Toggles the isSharable flag. When turning on, mirrors the doc to the
 * public collection with the provided password; when turning off, removes
 * the public mirror.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const uid = await authenticateAction();
    const { imageId } = await context.params;
    const { password } = await parseJsonBody(request, bodySchema);

    const coversRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));

    const newSharableState = await adminDb.runTransaction(async (tx: Transaction) => {
      const coverSnap = await tx.get(coversRef);
      if (!coverSnap.exists) return null;

      const sharable = !coverSnap.data()?.isSharable;
      if (sharable) {
        tx.set(publicRef, {
          ...coverSnap.data(),
          isSharable: true,
          password,
        });
        tx.update(coversRef, { isSharable: true });
      } else {
        tx.update(coversRef, { isSharable: false, password: "" });
        tx.delete(publicRef);
      }
      return sharable;
    });
    if (newSharableState === null) {
      return jsonError("Image not found", "NOT_FOUND", 404);
    }
    revalidateTag(PUBLIC_IMAGES_TAG, { expire: 0 });

    return jsonOk({ isSharable: newSharableState });
  } catch (error) {
    return errorToResponse(error);
  }
}
