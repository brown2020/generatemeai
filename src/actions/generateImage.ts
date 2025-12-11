"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { strategies } from "@/strategies";
import { resolveApiKeyFromForm } from "@/utils/apiKeyResolver";
import { assertSufficientCredits } from "@/utils/creditValidator";
import {
  ActionResult,
  successResult,
  errorResult,
  getErrorMessage,
} from "@/utils/errors";

/**
 * Image generation result data.
 */
interface ImageGenerationData {
  imageUrl: string;
  imageReference?: string;
}

/**
 * Saves a generated image to Firebase Storage.
 */
async function saveGeneratedImage(
  imageData: ArrayBuffer | Buffer,
  uid: string,
  prompt: string
): Promise<string> {
  const finalImage = Buffer.isBuffer(imageData)
    ? imageData
    : Buffer.from(new Uint8Array(imageData));
  const fileName = `generated/${uid}/${Date.now()}.jpg`;
  const file = adminBucket.file(fileName);

  await file.save(finalImage, {
    contentType: "image/jpeg",
  });

  await file.setMetadata({
    metadata: { prompt },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "03-17-2125",
  });

  return signedUrl;
}

/**
 * Saves a reference image to Firebase Storage.
 */
async function saveReferenceImage(img: File, uid: string): Promise<string> {
  const imageBuffer = Buffer.from(await img.arrayBuffer());
  const referenceFileName = `image-references/${uid}/${Date.now()}.jpg`;
  const referenceFile = adminBucket.file(referenceFileName);

  await referenceFile.save(imageBuffer, {
    contentType: "image/jpeg",
  });

  const [signedUrl] = await referenceFile.getSignedUrl({
    action: "read",
    expires: "03-17-2125",
  });

  return signedUrl;
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
    // Extract required parameters
    const message = data.get("message") as string | null;
    const uid = data.get("uid") as string | null;
    const modelName = data.get("model") as string | null;
    const useCredits = data.get("useCredits") === "true";
    const credits = Number(data.get("credits") || 0);
    const img = data.get("imageField") as File | null;

    // Validate required parameters
    if (!message || !uid || !modelName) {
      return errorResult(
        "Required parameters (message, uid, model) are missing.",
        "INVALID_INPUT"
      );
    }

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
    const imageUrl = await saveGeneratedImage(imageData, uid, message);

    // Handle uploaded reference image
    let imageReference: string | undefined;
    if (img) {
      imageReference = await saveReferenceImage(img, uid);
    }

    return successResult({ imageUrl, imageReference });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error generating image:", errorMessage);
    return errorResult(errorMessage, "GENERATION_FAILED");
  }
}
