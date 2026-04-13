"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import { Transaction } from "firebase-admin/firestore";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  AuthenticationError,
} from "@/utils/errors";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Toggles the shareable status of an image.
 * When making public: copies doc to publicImages.
 * When making private: removes from publicImages.
 */
export async function toggleImageSharable(
  imageId: string,
  password: string = ""
): Promise<ActionResult<{ isSharable: boolean }>> {
  try {
    const uid = await authenticateAction();

    const coversRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));

    const coversSnap = await coversRef.get();
    if (!coversSnap.exists) {
      return errorResult("Image not found", "NOT_FOUND");
    }

    const currentData = coversSnap.data()!;
    const newSharableState = !currentData.isSharable;

    await adminDb.runTransaction(async (tx: Transaction) => {
      const coverSnap = await tx.get(coversRef);
      if (!coverSnap.exists) throw new Error("Document not found");

      if (newSharableState) {
        tx.set(publicRef, {
          ...coverSnap.data(),
          isSharable: true,
          password,
        });
        tx.update(coversRef, { isSharable: true });
      } else {
        tx.update(coversRef, {
          isSharable: false,
          password: "",
        });
        tx.delete(publicRef);
      }
    });

    return successResult({ isSharable: newSharableState });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Deletes an image from both covers and publicImages.
 */
export async function deleteImage(
  imageId: string
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    const batch = adminDb.batch();
    batch.delete(adminDb.doc(FirestorePaths.profileCover(uid, imageId)));
    batch.delete(adminDb.doc(FirestorePaths.publicImage(imageId)));
    await batch.commit();

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Updates an image caption.
 */
export async function updateImageCaption(
  imageId: string,
  caption: string
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    await docRef.update({ caption: caption || "" });

    // Also update public copy if it exists
    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      await publicRef.update({ caption: caption || "" });
    }

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Updates image background color.
 */
export async function updateImageBackground(
  imageId: string,
  color: string
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    await docRef.update({ backgroundColor: color });

    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      await publicRef.update({ backgroundColor: color });
    }

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Updates image tags.
 */
export async function updateImageTags(
  imageId: string,
  tags: string[]
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    await docRef.update({ tags });

    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      await publicRef.update({ tags });
    }

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Updates image download URL (used after background removal).
 */
export async function updateImageDownloadUrl(
  imageId: string,
  downloadUrl: string
): Promise<ActionResult<void>> {
  try {
    const uid = await authenticateAction();

    const docRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
    await docRef.update({ downloadUrl });

    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      await publicRef.update({ downloadUrl });
    }

    return successResult(undefined);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}

/**
 * Fetches image data server-side for a given image ID.
 * Checks ownership first, then falls back to public.
 */
export async function fetchImageData(
  imageId: string
): Promise<
  ActionResult<{
    data: Record<string, unknown>;
    isOwner: boolean;
  }>
> {
  try {
    const uid = await authenticateAction().catch(() => null);

    // Try owner path first
    if (uid) {
      const ownerRef = adminDb.doc(FirestorePaths.profileCover(uid, imageId));
      const ownerSnap = await ownerRef.get();
      if (ownerSnap.exists) {
        return successResult({
          data: { id: imageId, ...ownerSnap.data() } as Record<string, unknown>,
          isOwner: true,
        });
      }
    }

    // Try public path
    const publicRef = adminDb.doc(FirestorePaths.publicImage(imageId));
    const publicSnap = await publicRef.get();
    if (publicSnap.exists) {
      return successResult({
        data: { id: imageId, ...publicSnap.data() } as Record<string, unknown>,
        isOwner: false,
      });
    }

    return errorResult("Image not found", "NOT_FOUND");
  } catch (error) {
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
}
