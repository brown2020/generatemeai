import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface GifConversionData {
  newId: string;
  gifUrl: string;
}

/**
 * Converts a stored video into a GIF and writes a new cover doc pointing at
 * the uploaded GIF.
 */
export function processVideoToGIF(
  firebaseVideoUrl: string,
  id: string
): Promise<ActionResult<GifConversionData>> {
  return apiPost<GifConversionData>("/api/generate/gif", {
    firebaseVideoUrl,
    id,
  });
}
