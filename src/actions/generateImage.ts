"use server";

import { getStrategy } from "@/strategies";
import { resolveApiKeyFromForm } from "@/utils/apiKeyResolver";
import { assertSufficientCredits } from "@/utils/creditValidator";
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
    // Authenticate — derive uid server-side, ignore client-provided uid
    const uid = await authenticateAction();

    // Validate and parse input
    const validatedInput = parseFormData(imageGenerationSchema, data);
    const {
      message,
      model: modelName,
      useCredits,
      credits,
      imageField,
      aspectRatio,
      negativePrompt,
      imageCount,
    } = validatedInput;
    
    // Normalize imageField (convert undefined to null)
    const img = imageField ?? null;

    // Check credits
    assertSufficientCredits(useCredits, credits, modelName);

    // Get the strategy for the model
    const strategy = getStrategy(modelName);
    if (!strategy) {
      return errorResult(`Unsupported model: ${modelName}`, "INVALID_INPUT");
    }

    // Resolve API key
    const apiKey = resolveApiKeyFromForm(modelName, useCredits, data);
    if (!apiKey) {
      return errorResult(
        `API key not configured for model: ${modelName}`,
        "INVALID_API_KEY"
      );
    }

    // Generate image(s)
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

    // Handle single or multi-image results
    const isMulti = Array.isArray(imageData);
    const dataArray = isMulti ? imageData : [imageData];

    const imageUrls = await Promise.all(
      dataArray.map((d) =>
        saveToStorage({
          data: d,
          path: createGeneratedImagePath(uid),
          metadata: { prompt: message },
        })
      )
    );

    // Handle uploaded reference image
    let imageReference: string | undefined;
    if (img) {
      imageReference = await saveToStorage({
        data: img,
        path: createReferenceImagePath(uid),
      });
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
