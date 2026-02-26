"use server";

import { resolveApiKey } from "@/utils";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus } from "@/constants/modelRegistry";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  AuthenticationError,
} from "@/utils/errors";
import { authenticateAction } from "@/utils/serverAuth";

const BRIA_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";

interface BackgroundRemovalData {
  result_url: string;
}

/**
 * Removes the background from an image using Bria AI.
 */
export const removeBackground = async (
  useCredits: boolean,
  credits: number,
  imageUrl: string,
  briaApiKey: string
): Promise<ActionResult<BackgroundRemovalData>> => {
  try {
    const uid = await authenticateAction();

    // Server-side credit check
    const serverCredits = await assertSufficientCreditsServer(uid, "bria.ai");

    const apiKey = resolveApiKey("bria.ai", serverCredits.useCredits, briaApiKey);
    if (!apiKey) {
      return errorResult("Bria API key is required.", "INVALID_API_KEY");
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return errorResult("Failed to fetch source image.", "GENERATION_FAILED");
    }
    const imageBlob = await imageResponse.blob();
    const formData = new FormData();
    formData.append("file", imageBlob, "image.png");

    const response = await fetch(BRIA_API_URL, {
      method: "POST",
      headers: { api_token: apiKey },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.result_url) {
      if (serverCredits.useCredits) {
        await deductCreditsServer(uid, creditsToMinus("bria.ai"));
      }
      return successResult({ result_url: result.result_url });
    }

    // Bria returns JSON with error messages — check for common auth failures
    const errorMsg =
      typeof result === "string"
        ? result
        : result?.message || result?.error || "";
    if (
      errorMsg.toLowerCase().includes("invalid") &&
      errorMsg.toLowerCase().includes("token")
    ) {
      return errorResult("Bria API key is invalid.", "INVALID_API_KEY");
    }

    return errorResult("Removing background failed.", "GENERATION_FAILED");
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    console.error("Error removing background:", getErrorMessage(error));
    return errorResult(getErrorMessage(error), "GENERATION_FAILED");
  }
};
