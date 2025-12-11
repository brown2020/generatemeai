/**
 * Firebase Storage utilities for server-side operations.
 * Provides a unified interface for saving files to Firebase Storage.
 */

import { adminBucket } from "@/firebase/firebaseAdmin";

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
 * Default signed URL expiration date (100 years from now).
 */
const DEFAULT_EXPIRY = "03-17-2125";

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
    expires: DEFAULT_EXPIRY,
  });

  return signedUrl;
}

/**
 * Creates a storage path for generated images.
 */
export const createGeneratedImagePath = (uid: string): string =>
  `generated/${uid}/${Date.now()}.jpg`;

/**
 * Creates a storage path for reference images.
 */
export const createReferenceImagePath = (uid: string): string =>
  `image-references/${uid}/${Date.now()}.jpg`;

/**
 * Creates a storage path for generated videos.
 */
export const createVideoPath = (): string =>
  `video-generation/${Date.now()}.mp4`;

/**
 * Creates a storage path for generated GIFs.
 */
export const createGifPath = (): string => `video-generation/${Date.now()}.gif`;

/**
 * Saves a video from URL to Firebase Storage.
 * Fetches the video, converts to buffer, and saves.
 */
export async function saveVideoFromUrl(videoUrl: string): Promise<string> {
  const response = await fetch(videoUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  return saveToStorage({
    data: buffer,
    path: createVideoPath(),
    contentType: "video/mp4",
  });
}

/**
 * Saves a GIF buffer to Firebase Storage.
 */
export async function saveGif(gifBuffer: Buffer): Promise<string> {
  return saveToStorage({
    data: gifBuffer,
    path: createGifPath(),
    contentType: "image/gif",
  });
}
