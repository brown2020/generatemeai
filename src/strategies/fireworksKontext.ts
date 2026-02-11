import { GenerationStrategy } from "./types";
import { pollWithTimeout } from "@/utils/polling";

const KONTEXT_MODEL = "flux-kontext-pro";
const BASE_URL =
  "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models";

interface KontextGenerateResponse {
  request_id: string;
}

interface KontextResultResponse {
  id: string;
  status: string;
  result: unknown;
  progress: number | null;
  details: object | null;
}

/**
 * Extracts the image URL or data from the Kontext result response.
 * Handles multiple possible result formats (URL string, data URI, or nested object).
 */
const extractImageData = (result: unknown): string => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    // BFL-style response: { sample: "https://..." }
    if (typeof obj.sample === "string") return obj.sample;
    if (typeof obj.url === "string") return obj.url;
    // Array-style response: { base64: ["data:image/..."] }
    if (Array.isArray(obj.base64) && typeof obj.base64[0] === "string") {
      return obj.base64[0] as string;
    }
  }
  throw new Error("Could not extract image from Fireworks Kontext response");
};

/**
 * FLUX.1 Kontext Pro strategy via Fireworks AI.
 *
 * Uses the async workflow API:
 * 1. POST to generate → returns request_id
 * 2. Poll get_result until status is "Ready"
 */
export const fireworksKontextStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
  aspectRatio,
}) => {
  const generateUrl = `${BASE_URL}/${KONTEXT_MODEL}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const requestBody: Record<string, unknown> = {
    prompt: message,
    aspect_ratio: aspectRatio || "1:1",
    output_format: "jpeg",
    safety_tolerance: 2,
  };

  // Support image editing via input_image (base64-encoded)
  if (img) {
    const arrayBuffer = await img.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    requestBody.input_image = `data:image/jpeg;base64,${base64}`;
  }

  // Step 1: Submit generation request
  const generateResponse = await fetch(generateUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!generateResponse.ok) {
    throw new Error(
      `Error from Fireworks Kontext API: ${generateResponse.status} ${generateResponse.statusText}`
    );
  }

  const { request_id } =
    (await generateResponse.json()) as KontextGenerateResponse;

  // Step 2: Poll for result
  const resultUrl = `${BASE_URL}/${KONTEXT_MODEL}/get_result`;

  const result = await pollWithTimeout<KontextResultResponse>(
    async () => {
      const response = await fetch(resultUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: request_id }),
      });

      if (!response.ok) {
        throw new Error(
          `Error polling Kontext result: ${response.status} ${response.statusText}`
        );
      }

      return response.json() as Promise<KontextResultResponse>;
    },
    (output) =>
      output.status === "Ready" ||
      output.status === "Error" ||
      output.status === "Content Moderated" ||
      output.status === "Request Moderated",
    { maxAttempts: 30, intervalMs: 2000 }
  );

  if (result.status !== "Ready" || !result.result) {
    throw new Error(
      `Fireworks Kontext generation failed with status: ${result.status}`
    );
  }

  // Step 3: Extract and fetch the image
  const imageData = extractImageData(result.result);

  // Handle URL-based results
  if (imageData.startsWith("http")) {
    const imageResponse = await fetch(imageData);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch generated image: ${imageResponse.status} ${imageResponse.statusText}`
      );
    }
    return imageResponse.arrayBuffer();
  }

  // Handle base64 data URI results
  if (imageData.startsWith("data:")) {
    const base64Data = imageData.split(",")[1];
    return Buffer.from(base64Data, "base64");
  }

  // Handle raw base64 string
  return Buffer.from(imageData, "base64");
};
