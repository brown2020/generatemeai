import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  imageGenerationSchema,
  parseFormData,
} from "@/utils/validationSchemas";
import { Timestamp } from "firebase-admin/firestore";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
  generationCreditCost,
  refundCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKeyFromForm } from "@/constants/modelRegistry";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
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
  isAppError,
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
      data: {
        imageUrl: string;
        imageUrls: string[];
        imageReference?: string;
        coverId: string;
      };
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
      let actorId = "";
      let chargedAmount = 0;

      try {
        const uid = await authenticateAction();
        actorId = uid;
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

        const { useCredits, imageCount: boundedCount } =
          await assertSufficientCreditsServer(uid, modelName, imageCount);
        const creditCost = generationCreditCost(modelName, imageCount);

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

        // Charge before the provider call so a parallel request cannot
        // spend the same balance, and refund if generation does not finish.
        if (useCredits) {
          await deductCreditsServer(uid, creditCost);
          chargedAmount = creditCost;
        }

        emit({ status: "generating" });
        const imageData = await strategy({
          message,
          img,
          apiKey,
          useCredits,
          aspectRatio: aspectRatio || "1:1",
          negativePrompt: negativePrompt || undefined,
          imageCount: boundedCount,
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

        let uploaded = 0;
        const imageUrls = await Promise.all(
          uploads.map(async (uploadPromise) => {
            const url = await uploadPromise;
            uploaded += 1;
            emit({ status: "uploading", uploaded, total });
            return url;
          })
        );

        let imageReference: string | undefined;
        if (img) {
          imageReference = await saveToStorage({
            data: img,
            path: createReferenceImagePath(uid),
          });
          uploaded += 1;
          emit({ status: "uploading", uploaded, total });
        }

        if (useCredits && dataArray.length < boundedCount) {
          const unused = creditsToMinus(modelName) * (boundedCount - dataArray.length);
          await refundCreditsServer(uid, unused);
          chargedAmount -= unused;
        }

        const coverRef = adminDb.collection(FirestorePaths.profileCovers(uid)).doc();
        await coverRef.set({
          id: coverRef.id,
          freestyle: message,
          style: "",
          downloadUrl: imageUrls[0],
          model: modelName,
          prompt: message,
          tags: [],
          imageCategory: "",
          lighting: "",
          colorScheme: "",
          imageReference: imageReference ?? "",
          perspective: "",
          composition: "",
          medium: "",
          mood: "",
          isSharable: false,
          timestamp: Timestamp.now(),
        });

        chargedAmount = 0;
        emit({
          status: "complete",
          data: {
            imageUrl: imageUrls[0],
            imageUrls,
            imageReference,
            coverId: coverRef.id,
          },
        });
      } catch (error) {
        let refunded = false;
        if (chargedAmount > 0) {
          try {
            await refundCreditsServer(actorId, chargedAmount);
            refunded = true;
          } catch (refundError) {
            console.error("[api] credit refund failed", refundError);
          }
        }
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
          const message = getErrorMessage(error);
          emit({
            status: "error",
            error: refunded ? `${message} Your credits were refunded.` : message,
            code: isAppError(error) ? (error.code as ErrorCode) : "GENERATION_FAILED",
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
