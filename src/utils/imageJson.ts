import "server-only";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";

/**
 * Shapes an image document for JSON responses. Admin Timestamps serialize as
 * `{ _seconds, _nanoseconds }`, so `timestamp` is sent as epoch milliseconds.
 */
const LOCKED_MEDIA_FIELDS = ["downloadUrl", "videoDownloadUrl", "imageReference"] as const;

export function toImageJson(id: string, data: DocumentData | undefined) {
  const timestamp = (data?.timestamp as Timestamp | undefined)?.toMillis?.();
  const rest = { ...(data ?? {}) };
  delete rest.password;
  return { id, ...rest, timestamp };
}

export function isImageLocked(data: DocumentData | undefined): boolean {
  return typeof data?.password === "string" && data.password.length > 0;
}

/** Viewer payload. Locked public images omit media URLs and never include the password. */
export function toViewerImageJson(
  id: string,
  data: DocumentData | undefined,
  locked: boolean
) {
  const json = toImageJson(id, data) as Record<string, unknown>;
  if (!locked) return { ...json, locked: false };
  for (const field of LOCKED_MEDIA_FIELDS) delete json[field];
  return { ...json, locked: true };
}
