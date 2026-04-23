import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, withAuth, errorToResponse } from "@/lib/api/server";
import { videoGenerationSchema, parseFormData } from "@/utils/validationSchemas";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKey } from "@/constants/modelRegistry";
import { pollWithTimeout } from "@/utils/polling";
import { saveVideoFromUrl } from "@/utils/storage";
import { ValidationError } from "@/utils/errors";

export const runtime = "nodejs";
// Video generation polls up to 24 × 5s for each provider.
export const maxDuration = 300;

interface DIdResponse {
  kind?: string;
  description?: string;
  id?: string;
  error?: { description: string };
  result_url?: string;
}

interface RunwayResponse {
  id?: string;
  status?: string;
  error?: { description: string };
  output?: string[];
}

/**
 * Calls D-ID's talks or animations endpoint depending on whether a script
 * prompt is supplied, then polls until the result_url is ready.
 */
async function generateDIdVideo(
  imageUrl: string,
  scriptPrompt: string | null,
  audio: string | null,
  animationType: string | null,
  apiKey: string
): Promise<string> {
  const endpoint = scriptPrompt ? "talks" : "animations";
  const url = `https://api.d-id.com/${endpoint}`;

  const body = {
    source_url: imageUrl,
    ...(scriptPrompt
      ? {
          script: {
            type: "text",
            subtitles: "false",
            provider: { type: "amazon", voice_id: audio },
            input: scriptPrompt,
          },
          config: { fluent: "false", pad_audio: "0.0", stitch: true },
        }
      : {
          driver_url: `bank://${animationType}`,
          config: { mute: true, stitch: true },
        }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const result: DIdResponse = await response.json();
  if (!result.id) {
    throw new Error(result.description || "D-ID API Token is invalid.");
  }

  const pollUrl = `https://api.d-id.com/${endpoint}/${result.id}`;
  const finalResult = await pollWithTimeout<DIdResponse>(
    async () => {
      const res = await fetch(pollUrl, {
        headers: {
          accept: "application/json",
          authorization: `Basic ${apiKey}`,
        },
      });
      return res.json();
    },
    (r) => !!r.result_url || !!r.error,
    { maxAttempts: 24, intervalMs: 5000 }
  );

  if (finalResult.error) throw new Error(finalResult.error.description);
  if (!finalResult.result_url) {
    throw new Error("D-ID video generation timed out");
  }
  return finalResult.result_url;
}

/**
 * Calls RunwayML image_to_video and polls until SUCCEEDED.
 */
async function generateRunwayVideo(
  imageUrl: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    "https://api.dev.runwayml.com/v1/image_to_video",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-09-13",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptImage: imageUrl,
        watermark: false,
      }),
    }
  );

  const result: RunwayResponse = await response.json();
  if (!result.id) throw new Error("Failed to start RunwayML generation");

  const finalResult = await pollWithTimeout<RunwayResponse>(
    async () => {
      const res = await fetch(
        `https://api.dev.runwayml.com/v1/tasks/${result.id}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-Runway-Version": "2024-09-13",
          },
        }
      );
      return res.json();
    },
    (r) => r.status === "SUCCEEDED" || !!r.error,
    { maxAttempts: 24, intervalMs: 5000 }
  );

  if (finalResult.error) throw new Error(finalResult.error.description);
  if (!finalResult.output?.[0]) {
    throw new Error("RunwayML video generation timed out");
  }
  return finalResult.output[0];
}

/**
 * POST /api/generate/video
 * Generates a video (D-ID or RunwayML) from a source image and stores the
 * output in Firebase Storage. Accepts multipart/form-data to match the
 * existing client payload shape.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorToResponse(
      new ValidationError("Request body must be multipart/form-data")
    );
  }

  let validatedInput: z.infer<typeof videoGenerationSchema>;
  try {
    validatedInput = parseFormData(videoGenerationSchema, formData);
  } catch (error) {
    return errorToResponse(error);
  }

  const { videoModel, imageUrl, scriptPrompt, audio, animationType } =
    validatedInput;

  if (!animationType && (!scriptPrompt || !audio)) {
    return jsonError(
      "Script prompt with audio or animation type is required.",
      "INVALID_INPUT",
      400
    );
  }

  const { useCredits } = await assertSufficientCreditsServer(uid, videoModel);
  const userApiKey =
    videoModel === "d-id"
      ? validatedInput.didAPIKey
      : validatedInput.runwayApiKey;
  const apiKey = resolveApiKey(videoModel, useCredits, userApiKey);

  if (!apiKey) {
    return jsonError(
      `API key not configured for model: ${videoModel}`,
      "INVALID_API_KEY",
      400
    );
  }

  let videoUrl: string;
  if (videoModel === "d-id") {
    videoUrl = await generateDIdVideo(
      imageUrl,
      scriptPrompt ?? null,
      audio ?? null,
      animationType ?? null,
      apiKey
    );
  } else if (videoModel === "runway-ml") {
    videoUrl = await generateRunwayVideo(imageUrl, apiKey);
  } else {
    return jsonError(
      `Unsupported video model: ${videoModel}`,
      "INVALID_INPUT",
      400
    );
  }

  const savedVideoUrl = await saveVideoFromUrl(videoUrl);

  if (useCredits) {
    await deductCreditsServer(uid, creditsToMinus(videoModel));
  }

  return jsonOk({ videoUrl: savedVideoUrl });
});
