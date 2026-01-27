"use server";

import { strategies } from "@/strategies";
import { resolveApiKeyFromForm } from "@/utils/apiKeyResolver";
import { assertSufficientCredits } from "@/utils/creditValidator";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
  ValidationError,
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

/**
 * Image generation result data.
 */
interface ImageGenerationData {
  imageUrl: string;
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
    // Validate and parse input
    const validatedInput = parseFormData(imageGenerationSchema, data);
    const { message, uid, model: modelName, useCredits, credits, imageField } = validatedInput;
    
    // Normalize imageField (convert undefined to null)
    const img = imageField ?? null;

    // Check credits
    assertSufficientCredits(useCredits, credits, modelName);

    // Get the strategy for the model
    const strategy = strategies[modelName];
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

    // Generate image
    const imageData = await strategy({
      message,
      img,
      apiKey,
      useCredits,
    });

    if (!imageData) {
      return errorResult(
        "Image generation failed - no image data returned",
        "GENERATION_FAILED"
      );
    }

    // Save generated image to Firebase
    const imageUrl = await saveToStorage({
      data: imageData,
      path: createGeneratedImagePath(uid),
      metadata: { prompt: message },
    });

    // Handle uploaded reference image
    let imageReference: string | undefined;
    if (img) {
      imageReference = await saveToStorage({
        data: img,
        path: createReferenceImagePath(uid),
      });
    }

    return successResult({ imageUrl, imageReference });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return errorResult(error.message, "VALIDATION_ERROR");
    }

    const errorMessage = getErrorMessage(error);
    console.error("Error generating image:", errorMessage);
    return errorResult(errorMessage, "GENERATION_FAILED");
  }
}
