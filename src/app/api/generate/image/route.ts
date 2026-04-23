import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  imageGenerationSchema,
  parseFormData,
} from "@/utils/validationSchemas";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKeyFromForm } from "@/constants/modelRegistry";
import { getStrategy } from "@/strategies";
import {
  saveToStorage,
  createGeneratedImagePath,
  createReferenceImagePath,
} from "@/utils/storage";
import { authenticateAction } from "@/utils/serverAuth";
import {
  AuthenticationError,
  ValidationError,
  getErrorMessage,
  type ErrorCode,
} from "@/utils/errors";

export const runtime = "nodejs";
// gpt-image-2 is faster than v1 but can still exceed 60s at high quality.
// Tune to your Vercel plan limits (Hobby: 60, Pro/Fluid: up to 300).
export const maxDuration = 300;

/**
 * One chunk of NDJSON the client receives. The client just needs to look at
 * `status` to drive progress UI and act on `complete`/`error` terminally.
 */
type ProgressEvent =
  | { status: "started" }
  | { status: "generating" }
  | { status: "uploading"; uploaded: number; total: number }
  | {
      status: "complete";
      data: { imageUrl: string; imageUrls: string[]; imageReference?: string };
    }
  | { status: "error"; error: string; code?: ErrorCode };

const encoder = new TextEncoder();

/**
 * Serializes a progress event as an NDJSON line so the client can read
 * message-by-message without framing a custom protocol.
 */
function line(event: ProgressEvent): Uint8Array {
  return encoder.encode(JSON.stringify(event) + "\n");
}

/**
 * POST /api/generate/image
 * Streams NDJSON progress events while generating. Final event is either
 * { status: "complete", data } or { status: "error", error, code }.
 *
 * The route always responds 200 with a stream so that errors reach the
 * client as structured events (a non-200 response body can't be parsed as
 * newline-delimited JSON). The client surfaces the error to the user.
 */
export async function POST(request: NextRequest) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ProgressEvent) => controller.enqueue(line(event));

      try {
        const uid = await authenticateAction();
        emit({ status: "started" });

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          throw new ValidationError("Request body must be multipart/form-data");
        }

        let validatedInput: z.infer<typeof imageGenerationSchema>;
        try {
          validatedInput = parseFormData(imageGenerationSchema, formData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError(
              error.issues[0]?.message ?? "Validation failed"
            );
          }
          throw error;
        }

        const {
          message,
          model: modelName,
          imageField,
          aspectRatio,
          negativePrompt,
          imageCount,
        } = validatedInput;
        const img = imageField ?? null;

        const { useCredits } = await assertSufficientCreditsServer(
          uid,
          modelName
        );

        const strategy = getStrategy(modelName);
        if (!strategy) {
          throw new ValidationError(`Unsupported model: ${modelName}`);
        }

        const apiKey = resolveApiKeyFromForm(modelName, useCredits, formData);
        if (!apiKey) {
          emit({
            status: "error",
            error: `API key not configured for model: ${modelName}`,
            code: "INVALID_API_KEY",
          });
          controller.close();
          return;
        }

        emit({ status: "generating" });
        const imageData = await strategy({
          message,
          img,
          apiKey,
          useCredits,
          aspectRatio: aspectRatio || "1:1",
          negativePrompt: negativePrompt || undefined,
          imageCount: imageCount || 1,
        });

        if (!imageData) {
          throw new Error("Image generation failed - no image data returned");
        }

        const dataArray = Array.isArray(imageData) ? imageData : [imageData];
        if (dataArray.length === 0) {
          throw new Error(
            "Image generation failed - empty result from provider"
          );
        }

        const total = dataArray.length + (img ? 1 : 0);
        emit({ status: "uploading", uploaded: 0, total });

        // Upload in parallel but emit progress sequentially as each resolves.
        const uploads = dataArray.map((data) =>
          saveToStorage({
            data,
            path: createGeneratedImagePath(uid),
            metadata: { prompt: message },
          })
        );

        const imageUrls: string[] = [];
        let uploaded = 0;
        for (const uploadPromise of uploads) {
          const url = await uploadPromise;
          imageUrls.push(url);
          uploaded += 1;
          emit({ status: "uploading", uploaded, total });
        }

        let imageReference: string | undefined;
        if (img) {
          imageReference = await saveToStorage({
            data: img,
            path: createReferenceImagePath(uid),
          });
          uploaded += 1;
          emit({ status: "uploading", uploaded, total });
        }

        if (useCredits) {
          await deductCreditsServer(uid, creditsToMinus(modelName));
        }

        emit({
          status: "complete",
          data: { imageUrl: imageUrls[0], imageUrls, imageReference },
        });
      } catch (error) {
        if (error instanceof AuthenticationError) {
          emit({
            status: "error",
            error: error.message,
            code: "AUTHENTICATION_REQUIRED",
          });
        } else if (error instanceof ValidationError) {
          emit({
            status: "error",
            error: error.message,
            code: "VALIDATION_ERROR",
          });
        } else {
          emit({
            status: "error",
            error: getErrorMessage(error),
            code: "GENERATION_FAILED",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
