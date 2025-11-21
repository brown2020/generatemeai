"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { strategies } from "@/strategies";

// Function to check credits
function checkCredits(
  useCredits: string | null,
  credits: string | null,
  modelName: string | null
) {
  if (
    useCredits === "true" &&
    credits &&
    modelName &&
    Number(credits) < creditsToMinus(modelName as model)
  ) {
    throw new Error(
      "Not enough credits to generate an image. Please purchase credits or use your own API keys."
    );
  }
}

export async function generateImage(data: FormData) {
  try {
    const message = data.get("message") as string | null;
    const uid = data.get("uid") as string | null;
    const openAPIKey = data.get("openAPIKey") as string | null;
    const fireworksAPIKey = data.get("fireworksAPIKey") as string | null;
    const stabilityAPIKey = data.get("stabilityAPIKey") as string | null;
    const replicateAPIKey = data.get("replicateAPIKey") as string | null;
    const ideogramAPIKey = data.get("ideogramAPIKey") as string | null;
    const useCredits = data.get("useCredits") as string | null;
    const credits = data.get("credits") as string | null;
    const modelName = data.get("model") as string | null;
    const img = data.get("imageField") as File | null;

    if (!message || !uid || !modelName) {
      throw new Error("Required parameters (message, uid, model) are missing.");
    }

    checkCredits(useCredits, credits, modelName);

    const strategy = strategies[modelName];
    if (!strategy) {
      throw new Error(`Unsupported model: ${modelName}`);
    }

    // Select correct API Key
    let apiKey = "";
    const isUsingCredits = useCredits === "true";

    switch (modelName) {
      case "dall-e":
        apiKey = isUsingCredits ? process.env.OPENAI_API_KEY! : openAPIKey!;
        break;
      case "stable-diffusion-xl":
      case "playground-v2":
      case "playground-v2-5":
        apiKey = isUsingCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!;
        break;
      case "stability-sd3-turbo":
        apiKey = isUsingCredits ? process.env.STABILITY_API_KEY! : stabilityAPIKey!;
        break;
      case "flux-schnell":
        apiKey = isUsingCredits ? process.env.REPLICATE_API_KEY! : replicateAPIKey!;
        break;
      case "ideogram-ai":
        apiKey = isUsingCredits ? process.env.IDEOGRAM_API_KEY! : ideogramAPIKey!;
        break;
      default:
        // Should be caught by strategy check, but fallback
        apiKey = "";
    }

    // Generate Image
    const imageData = await strategy({
      message,
      img,
      apiKey,
      useCredits: isUsingCredits,
    });

    let imageUrl;
    if (imageData) {
      const finalImage = Buffer.from(new Uint8Array(imageData));
      // Save the generated image to Firebase
      const fileName = `generated/${uid}/${Date.now()}.jpg`;
      const file = adminBucket.file(fileName);

      await file.save(finalImage, {
        contentType: "image/jpeg",
      });

      const metadata = {
        metadata: {
          prompt: message,
        },
      };

      await file.setMetadata(metadata);

      [imageUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });
    }

    let imageReference;

    // Handle uploaded image reference
    if (img) {
      const imageBuffer = Buffer.from(await img.arrayBuffer());
      const referenceFileName = `image-references/${uid}/${Date.now()}.jpg`;
      const referenceFile = adminBucket.file(referenceFileName);

      await referenceFile.save(imageBuffer, {
        contentType: "image/jpeg",
      });

      const [imageReferenceUrl] = await referenceFile.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });

      imageReference = imageReferenceUrl;
    }

    return {
      imageUrl,
      imageReference,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image/video:", errorMessage);
    return {
      error: errorMessage,
    };
  }
}
