"use server";

import { resolveApiKey } from "@/utils/apiKeyResolver";
import { assertSufficientCredits } from "@/utils/creditValidator";
import { pollWithTimeout } from "@/utils/polling";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  ValidationError,
  AuthenticationError,
} from "@/utils/errors";
import { saveVideoFromUrl } from "@/utils/storage";
import { videoGenerationSchema, parseFormData } from "@/utils/validationSchemas";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Response types for video generation APIs.
 */
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
 * Video generation result data.
 */
interface VideoGenerationData {
  videoUrl: string;
}

/**
 * Generates a video using D-ID API.
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

  // Poll for result
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

  if (finalResult.error) {
    throw new Error(finalResult.error.description);
  }

  if (!finalResult.result_url) {
    throw new Error("D-ID video generation timed out");
  }

  return finalResult.result_url;
}

/**
 * Generates a video using RunwayML API.
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

  if (!result.id) {
    throw new Error("Failed to start RunwayML generation");
  }

  // Poll for result
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

  if (finalResult.error) {
    throw new Error(finalResult.error.description);
  }

  if (!finalResult.output?.[0]) {
    throw new Error("RunwayML video generation timed out");
  }

  return finalResult.output[0];
}

/**
 * Generates a video using the specified AI model.
 *
 * @param data - FormData containing generation parameters
 * @returns ActionResult with video URL or error
 */
export async function generateVideo(
  data: FormData
): Promise<ActionResult<VideoGenerationData>> {
  try {
    // Authenticate server-side
    await authenticateAction();

    // Validate and parse input
    const validatedInput = parseFormData(videoGenerationSchema, data);
    const {
      videoModel,
      imageUrl,
      useCredits,
      credits,
      scriptPrompt,
      audio,
      animationType,
    } = validatedInput;

    if (!animationType && (!scriptPrompt || !audio)) {
      return errorResult(
        "Script prompt with audio or animation type is required.",
        "INVALID_INPUT"
      );
    }

    // Check credits
    assertSufficientCredits(useCredits, credits, videoModel);

    // Resolve API key
    const userApiKey =
      videoModel === "d-id"
        ? validatedInput.didAPIKey
        : validatedInput.runwayApiKey;
    const apiKey = resolveApiKey(videoModel, useCredits, userApiKey);

    if (!apiKey) {
      return errorResult(
        `API key not configured for model: ${videoModel}`,
        "INVALID_API_KEY"
      );
    }

    // Generate video based on model
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
      return errorResult(
        `Unsupported video model: ${videoModel}`,
        "INVALID_INPUT"
      );
    }

    // Save to Firebase Storage
    const savedVideoUrl = await saveVideoFromUrl(videoUrl);

    return successResult({ videoUrl: savedVideoUrl });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    if (error instanceof ValidationError) {
      return errorResult(error.message, "VALIDATION_ERROR");
    }
    const errorMessage = getErrorMessage(error);
    console.error("Error generating video:", errorMessage);
    return errorResult(errorMessage, "GENERATION_FAILED");
  }
}
