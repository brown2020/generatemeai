import type { NextRequest } from "next/server";
import { z } from "zod";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import {
  jsonError,
  jsonOk,
  parseJsonBody,
  errorToResponse,
} from "@/lib/api/server";
import { authenticateAction } from "@/utils/serverAuth";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ imageId: string }>;
}

const patchSchema = z
  .object({
    caption: z.string().optional(),
    backgroundColor: z.string().optional(),
    tags: z.array(z.string()).optional(),
    downloadUrl: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });

/**
 * GET /api/images/:imageId
 * Fetches image data, preferring owner data; falls back to the public copy.
 * Returns isOwner so the caller can decide what controls to show.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { imageId } = await context.params;

  try {
    const uid = await authenticateAction().catch(() => null);

    if (uid) {
      const ownerRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
      const ownerSnap = await ownerRef.get();
      if (ownerSnap.exists) {
        return jsonOk({
          data: { id: imageId, ...ownerSnap.data() } as Record<string, unknown>,
          isOwner: true,
        });
      }
    }

    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      return jsonOk({
        data: { id: imageId, ...publicSnap.data() } as Record<string, unknown>,
        isOwner: false,
      });
    }

    return jsonError("Image not found", "NOT_FOUND", 404);
  } catch (error) {
    return errorToResponse(error);
  }
}

/**
 * PATCH /api/images/:imageId
 * Updates owner-editable fields on both the owner doc and the public mirror
 * (when present). All provided fields are applied in a single update.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const uid = await authenticateAction();
    const { imageId } = await context.params;
    const updates = await parseJsonBody(request, patchSchema);

    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    // Normalise caption to "" when explicitly set
    const normalized: Record<string, unknown> = { ...updates };
    if ("caption" in normalized) {
      normalized.caption = normalized.caption ?? "";
    }

    await docRef.update(normalized);

    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      await publicRef.update(normalized);
    }

    return jsonOk<void>(undefined);
  } catch (error) {
    return errorToResponse(error);
  }
}

/**
 * DELETE /api/images/:imageId
 * Deletes the image from the owner's covers and any public copy.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const uid = await authenticateAction();
    const { imageId } = await context.params;

    const batch = adminDb.batch();
    batch.delete(adminDb.doc(FirestorePaths.profileCover(uid, imageId)));
    batch.delete(adminDb.doc(FirestorePaths.publicImage(imageId)));
    await batch.commit();

    return jsonOk<void>(undefined);
  } catch (error) {
    return errorToResponse(error);
  }
}
