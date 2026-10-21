import "server-only";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";

/**
 * Shapes an image document for JSON responses. Admin Timestamps serialize as
 * `{ _seconds, _nanoseconds }`, so `timestamp` is sent as epoch milliseconds.
 */
export function toImageJson(id: string, data: DocumentData | undefined) {
  const timestamp = (data?.timestamp as Timestamp | undefined)?.toMillis?.();
  return { id, ...data, timestamp };
}
