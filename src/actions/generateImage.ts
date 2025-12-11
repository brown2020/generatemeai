"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import { strategies } from "@/strategies";
import { resolveApiKeyFromForm } from "@/utils/apiKeyResolver";
import { assertSufficientCredits } from "@/utils/creditValidator";
import { getErrorMessage } from "@/utils/errors";

/**
 * Result type for image generation.
 */
type GenerateImageResult =
  | { imageUrl: string; imageReference?: string; error?: never }
  | { error: string; imageUrl?: never; imageReference?: never };

/**
 * Generates an image using the specified AI model.
 *
 * @param data - FormData containing generation parameters
 * @returns Generated image URL or error
 */
export async function generateImage(
  data: FormData
): Promise<GenerateImageResult> {
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
      throw new Error("Required parameters (message, uid, model) are missing.");
    }

    // Check credits
    assertSufficientCredits(useCredits, credits, modelName);

    // Get the strategy for the model
    const strategy = strategies[modelName];
    if (!strategy) {
      throw new Error(`Unsupported model: ${modelName}`);
    }

    // Resolve API key
    const apiKey = resolveApiKeyFromForm(modelName, useCredits, data);
    if (!apiKey) {
      throw new Error(`API key not configured for model: ${modelName}`);
    }

    // Generate image
    const imageData = await strategy({
      message,
      img,
      apiKey,
      useCredits,
    });

    // Save generated image to Firebase
    let imageUrl: string | undefined;
    if (imageData) {
      const finalImage = Buffer.from(new Uint8Array(imageData));
      const fileName = `generated/${uid}/${Date.now()}.jpg`;
      const file = adminBucket.file(fileName);

      await file.save(finalImage, {
        contentType: "image/jpeg",
      });

      await file.setMetadata({
        metadata: { prompt: message },
      });

      [imageUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });
    }

    // Handle uploaded reference image
    let imageReference: string | undefined;
    if (img) {
      const imageBuffer = Buffer.from(await img.arrayBuffer());
      const referenceFileName = `image-references/${uid}/${Date.now()}.jpg`;
      const referenceFile = adminBucket.file(referenceFileName);

      await referenceFile.save(imageBuffer, {
        contentType: "image/jpeg",
      });

      [imageReference] = await referenceFile.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });
    }

    if (!imageUrl) {
      throw new Error("Image generation failed - no image data returned");
    }

    return { imageUrl, imageReference };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error generating image:", errorMessage);
    return { error: errorMessage };
  }
}
