import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKey } from "@/constants/modelRegistry";

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

  const { useCredits } = await assertSufficientCreditsServer(uid, "bria.ai");
  const apiKey = resolveApiKey("bria.ai", useCredits, briaApiKey);
  if (!apiKey) {
    return jsonError("Bria API key is required.", "INVALID_API_KEY", 400);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
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

  const result: { result_url?: string; message?: string; error?: string } =
    await response.json();

  if (response.ok && result.result_url) {
    if (useCredits) {
      await deductCreditsServer(uid, creditsToMinus("bria.ai"));
    }
    return jsonOk({ result_url: result.result_url });
  }

  const errorMsg =
    typeof result === "string"
      ? result
      : result?.message || result?.error || "";
  if (
    errorMsg.toLowerCase().includes("invalid") &&
    errorMsg.toLowerCase().includes("token")
  ) {
    return jsonError("Bria API key is invalid.", "INVALID_API_KEY", 401);
  }

  return jsonError("Removing background failed.", "GENERATION_FAILED", 502);
});
