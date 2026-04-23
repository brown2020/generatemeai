import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface BackgroundRemovalData {
  result_url: string;
}

/**
 * Removes the background from an image using Bria AI.
 *
 * The first two parameters are kept for call-site compatibility but are no
 * longer authoritative — the server reads credit state from Firestore.
 */
export function removeBackground(
  _useCredits: boolean,
  _credits: number,
  imageUrl: string,
  briaApiKey: string
): Promise<ActionResult<BackgroundRemovalData>> {
  return apiPost<BackgroundRemovalData>("/api/generate/background-removal", {
    imageUrl,
    briaApiKey,
  });
}
