import { apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

/**
 * Suggests six tags for an image based on its generation parameters.
 */
export function suggestTags(
  freestyle: string,
  color: string,
  lighting: string,
  style: string,
  imageCategory: string,
  tags: string[],
  openAPIKey: string,
  useCredits: boolean,
  credits: number
): Promise<ActionResult<string>> {
  return apiPost<string>("/api/generate/tags", {
    prompt: freestyle,
    colorScheme: color,
    lighting,
    imageStyle: style,
    selectedCategory: imageCategory,
    currentTags: tags,
    openAPIKey,
    useCredits,
    credits,
  });
}
