/**
 * Firebase Storage utilities for server-side operations.
 * Provides a unified interface for saving files to Firebase Storage.
 */

import { randomUUID } from "crypto";
import { adminBucket } from "@/firebase/firebaseAdmin";
import {
  fetchChecked,
  isUserMediaUrl,
  MAX_VIDEO_BYTES,
  storageObjectPath,
  isSafeRemoteUrl,
} from "@/utils/storageUrl";

/**
 * Options for saving files to storage.
 */
export interface SaveToStorageOptions {
  /** The file data to save */
  data: ArrayBuffer | Buffer | File;
  /** The storage path (e.g., "generated/uid/timestamp.jpg") */
  path: string;
  /** Content type (defaults to "image/jpeg") */
  contentType?: string;
  /** Optional metadata to attach to the file */
  metadata?: Record<string, string>;
}

/**
 * Computes a signed URL expiration date ~100 years from now.
 */
function getDefaultExpiry(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  return date.toISOString();
}

/**
 * Converts various data types to a Buffer.
 */
const toBuffer = async (data: ArrayBuffer | Buffer | File): Promise<Buffer> => {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data instanceof File) {
    return Buffer.from(await data.arrayBuffer());
  }
  return Buffer.from(new Uint8Array(data));
};

/**
 * Saves data to Firebase Storage and returns a signed URL.
 *
 * @param options - Save options including data, path, and optional metadata
 * @returns A signed URL for accessing the saved file
 *
 * @example
 * // Save generated image
 * const url = await saveToStorage({
 *   data: imageBuffer,
 *   path: `generated/${uid}/${Date.now()}.jpg`,
 *   metadata: { prompt: "a sunset over mountains" }
 * });
 *
 * @example
 * // Save uploaded reference image
 * const url = await saveToStorage({
 *   data: uploadedFile,
 *   path: `image-references/${uid}/${Date.now()}.jpg`
 * });
 */
export async function saveToStorage({
  data,
  path,
  contentType = "image/jpeg",
  metadata,
}: SaveToStorageOptions): Promise<string> {
  const buffer = await toBuffer(data);
  const file = adminBucket.file(path);

  await file.save(buffer, { contentType });

  if (metadata) {
    await file.setMetadata({ metadata });
  }

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: getDefaultExpiry(),
  });

  return signedUrl;
}

/**
 * Creates a storage path for generated images.
 */
export const createGeneratedImagePath = (uid: string): string =>
  `generated/${uid}/${randomUUID()}.jpg`;

/**
 * Creates a storage path for reference images.
 */
export const createReferenceImagePath = (uid: string): string =>
  `image-references/${uid}/${randomUUID()}.jpg`;

/**
 * Creates a storage path for generated videos.
 */
export const createVideoPath = (uid: string): string =>
  `video-generation/${uid}/${randomUUID()}.mp4`;

/**
 * Creates a storage path for generated GIFs.
 */
export const createGifPath = (uid: string): string =>
  `video-generation/${uid}/${randomUUID()}.gif`;

/**
 * Saves a video from URL to Firebase Storage.
 * Fetches the video, converts to buffer, and saves.
 */
export async function saveVideoFromUrl(videoUrl: string, uid: string): Promise<string> {
  const buffer = await fetchChecked(videoUrl, {
    maxBytes: MAX_VIDEO_BYTES,
    allow: isSafeRemoteUrl,
  });

  return saveToStorage({
    data: buffer,
    path: createVideoPath(uid),
    contentType: "video/mp4",
  });
}

/**
 * Saves a GIF buffer to Firebase Storage.
 */
export async function saveGif(gifBuffer: Buffer, uid: string): Promise<string> {
  return saveToStorage({
    data: gifBuffer,
    path: createGifPath(uid),
    contentType: "image/gif",
  });
}

/** Deletes one object when the URL is an object this account owns. */
export async function deleteOwnedObject(url: unknown, uid: string): Promise<void> {
  if (typeof url !== "string" || !isUserMediaUrl(url, uid)) return;
  const objectPath = storageObjectPath(url);
  if (!objectPath) return;
  await adminBucket.file(objectPath).delete({ ignoreNotFound: true });
}

/**
 * Deletes this account's storage prefixes, plus legacy `video-generation/{file}`
 * objects referenced by the account's own gallery URLs.
 */
export async function deleteUserStorage(uid: string, urls: string[]): Promise<void> {
  const prefixes = [
    `generated/${uid}/`,
    `image-references/${uid}/`,
    `video-generation/${uid}/`,
  ];
  for (const prefix of prefixes) {
    await adminBucket.deleteFiles({ prefix, force: true });
  }

  for (const url of urls) {
    const objectPath = storageObjectPath(url);
    if (!objectPath || !/^video-generation\/[^/]+$/.test(objectPath)) continue;
    await adminBucket.file(objectPath).delete({ ignoreNotFound: true });
  }
}
