"use server";

import { assertSufficientCredits, resolveApiKey } from "@/utils";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
} from "@/utils/errors";

const BRIA_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";

/**
 * Background removal result data.
 */
interface BackgroundRemovalData {
  result_url: string;
}

/**
 * Removes the background from an image using Bria AI.
 *
 * @returns ActionResult with result URL or error
 */
export const removeBackground = async (
  useCredits: boolean,
  credits: number,
  imageUrl: string,
  briaApiKey: string
): Promise<ActionResult<BackgroundRemovalData>> => {
  try {
    // Validate credits
    assertSufficientCredits(useCredits, credits, "bria.ai");

    // Resolve API key
    const apiKey = resolveApiKey("bria.ai", useCredits, briaApiKey);
    if (!apiKey) {
      return errorResult("Bria API key is required.", "INVALID_API_KEY");
    }

    // Fetch image and create form data
    const imageBlob = await fetch(imageUrl).then((res) => res.blob());
    const formData = new FormData();
    formData.append("file", imageBlob, "image.png");

    // Make API request
    const response = await fetch(BRIA_API_URL, {
      method: "POST",
      headers: { api_token: apiKey },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.result_url) {
      return successResult({ result_url: result.result_url });
    }

    if (result === "Invalid customer token key") {
      return errorResult("Bria API key is invalid.", "INVALID_API_KEY");
    }

    return errorResult("Removing background failed.", "GENERATION_FAILED");
  } catch (error: unknown) {
    console.error("Error removing background:", error);
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
};
