"use server";

import { assertSufficientCredits, resolveApiKey } from "@/utils";
import { getErrorMessage } from "@/utils/errors";

const BRIA_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";

interface RemoveBackgroundResult {
  result_url?: string;
  error?: string;
}

/**
 * Removes the background from an image using Bria AI.
 */
export const removeBackground = async (
  useCredits: boolean,
  credits: number,
  imageUrl: string,
  briaApiKey: string
): Promise<RemoveBackgroundResult> => {
  try {
    // Validate credits
    assertSufficientCredits(useCredits, credits, "bria.ai");

    // Resolve API key
    const apiKey = resolveApiKey("bria.ai", useCredits, briaApiKey);
    if (!apiKey) {
      return { error: "Bria API key is required." };
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

    if (response.ok) {
      return result;
    }

    if (result === "Invalid customer token key") {
      return { error: "Bria API key is invalid." };
    }

    throw new Error("Removing background failed.");
  } catch (error: unknown) {
    console.error("Error removing background:", error);
    return { error: getErrorMessage(error) };
  }
};
