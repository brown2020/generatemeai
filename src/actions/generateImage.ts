"use server";

import { getStrategy } from "@/strategies";
import { resolveApiKeyFromForm } from "@/utils/apiKeyResolver";
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
  ValidationError,
  AuthenticationError,
} from "@/utils/errors";
import {
  saveToStorage,
  createGeneratedImagePath,
  createReferenceImagePath,
} from "@/utils/storage";
import {
  imageGenerationSchema,
  parseFormData,
} from "@/utils/validationSchemas";
import { authenticateAction } from "@/utils/serverAuth";

/**
 * Image generation result data.
 */
interface ImageGenerationData {
  imageUrl: string;
  imageUrls: string[];
  imageReference?: string;
}

/**
 * Generates an image using the specified AI model.
 *
 * @param data - FormData containing generation parameters
 * @returns ActionResult with image URL or error
 */
export async function generateImage(
  data: FormData
): Promise<ActionResult<ImageGenerationData>> {
  try {
    const uid = await authenticateAction();

    const validatedInput = parseFormData(imageGenerationSchema, data);
    const {
      message,
      model: modelName,
      imageField,
      aspectRatio,
      negativePrompt,
      imageCount,
    } = validatedInput;
    
    const img = imageField ?? null;

    // Server-side credit check — reads from Firestore, not client FormData
    const { useCredits } = await assertSufficientCreditsServer(uid, modelName);

    const strategy = getStrategy(modelName);
    if (!strategy) {
      return errorResult(`Unsupported model: ${modelName}`, "INVALID_INPUT");
    }

    const apiKey = resolveApiKeyFromForm(modelName, useCredits, data);
    if (!apiKey) {
      return errorResult(
        `API key not configured for model: ${modelName}`,
        "INVALID_API_KEY"
      );
    }

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
      return errorResult(
        "Image generation failed - no image data returned",
        "GENERATION_FAILED"
      );
    }

    const isMulti = Array.isArray(imageData);
    const dataArray = isMulti ? imageData : [imageData];

    if (dataArray.length === 0) {
      return errorResult(
        "Image generation failed - empty result from provider",
        "GENERATION_FAILED"
      );
    }

    const imageUrls = await Promise.all(
      dataArray.map((d) =>
        saveToStorage({
          data: d,
          path: createGeneratedImagePath(uid),
          metadata: { prompt: message },
        })
      )
    );

    let imageReference: string | undefined;
    if (img) {
      imageReference = await saveToStorage({
        data: img,
        path: createReferenceImagePath(uid),
      });
    }

    // Deduct credits server-side after successful generation
    if (useCredits) {
      await deductCreditsServer(uid, creditsToMinus(modelName));
    }

    return successResult({ imageUrl: imageUrls[0], imageUrls, imageReference });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    if (error instanceof ValidationError) {
      return errorResult(error.message, "VALIDATION_ERROR");
    }

    const errorMessage = getErrorMessage(error);
    console.error("Error generating image:", errorMessage);
    return errorResult(errorMessage, "GENERATION_FAILED");
  }
}
