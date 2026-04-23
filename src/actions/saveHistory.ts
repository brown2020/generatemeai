import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface SaveHistoryParams {
  freestyle: string;
  style: string;
  downloadUrl: string;
  model: string;
  prompt: string;
  tags: string[];
  imageCategory: string;
  lighting: string;
  colorScheme: string;
  imageReference: string;
  perspective: string;
  composition: string;
  medium: string;
  mood: string;
}

/**
 * Persists a generation record to the user's covers subcollection.
 */
export function saveGenerationHistory(
  params: SaveHistoryParams
): Promise<ActionResult<{ id: string }>> {
  return apiPost<{ id: string }>("/api/history", params);
}
