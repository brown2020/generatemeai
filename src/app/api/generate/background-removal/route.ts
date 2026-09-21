import type { NextRequest } from "next/server";
import { z } from "zod";
import { errorToResponse, jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
  refundCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKey } from "@/constants/modelRegistry";
import { isAllowedStorageUrl } from "@/utils/storageUrl";

export const runtime = "nodejs";
export const maxDuration = 60;

const BRIA_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";

const bodySchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  briaApiKey: z.string().optional(),
});

/**
 * POST /api/generate/background-removal
 * Removes the background from an image via Bria AI. Fetches the source image
 * server-side so it doesn't have to pass through the client.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { imageUrl, briaApiKey } = await parseJsonBody(request, bodySchema);

  // Only fetch the user's own Storage media — blocks SSRF to internal hosts.
  if (!isAllowedStorageUrl(imageUrl)) {
    return jsonError("Unsupported image URL.", "VALIDATION_ERROR", 400);
  }

  const { useCredits } = await assertSufficientCreditsServer(uid, "bria.ai");
  const apiKey = resolveApiKey("bria.ai", useCredits, briaApiKey);
  if (!apiKey) {
    return jsonError("Bria API key is required.", "INVALID_API_KEY", 400);
  }

  let chargedAmount = 0;
  const refundCharge = async () => {
    if (chargedAmount <= 0) return;
    const amount = chargedAmount;
    chargedAmount = 0;
    try {
      await refundCreditsServer(uid, amount);
    } catch (refundError) {
      console.error("[api] credit refund failed", refundError);
    }
  };

  try {
    if (useCredits) {
      const cost = creditsToMinus("bria.ai");
      await deductCreditsServer(uid, cost);
      chargedAmount = cost;
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      await refundCharge();
      return jsonError("Failed to fetch source image.", "GENERATION_FAILED", 502);
    }
    const imageBlob = await imageResponse.blob();

    const formData = new FormData();
    formData.append("file", imageBlob, "image.png");

    const response = await fetch(BRIA_API_URL, {
      method: "POST",
      headers: { api_token: apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errorBody: { message?: string; error?: string } | string =
        await response.json();
      const errorMsg =
        typeof errorBody === "string"
          ? errorBody
          : errorBody?.message || errorBody?.error || "";
      await refundCharge();
      if (
        errorMsg.toLowerCase().includes("invalid") &&
        errorMsg.toLowerCase().includes("token")
      ) {
        return jsonError("Bria API key is invalid.", "INVALID_API_KEY", 401);
      }
      return jsonError("Removing background failed.", "GENERATION_FAILED", 502);
    }

    const result: { result_url?: string; message?: string; error?: string } =
      await response.json();

    if (result.result_url) {
      chargedAmount = 0;
      return jsonOk({ result_url: result.result_url });
    }

    await refundCharge();
    return jsonError("Removing background failed.", "GENERATION_FAILED", 502);
  } catch (error) {
    await refundCharge();
    return errorToResponse(error);
  }
});
