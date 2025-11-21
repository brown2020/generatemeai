"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";

interface DalleResponse {
  data: {
    url: string;
  }[];
}

interface IdeogramResponse {
  created: string;
  data: {
    is_image_safe: boolean;
    prompt: string;
    resolution: string;
    seed: number;
    style_type: string;
    url: string;
  }[];
}

enum AspectRatio {
  ASPECT_10_16 = "ASPECT_10_16",
  ASPECT_16_10 = "ASPECT_16_10",
  ASPECT_16_9 = "ASPECT_16_9",
  ASPECT_1_1 = "ASPECT_1_1",
  ASPECT_1_3 = "ASPECT_1_3",
  ASPECT_2_3 = "ASPECT_2_3",
  ASPECT_3_1 = "ASPECT_3_1",
  ASPECT_3_2 = "ASPECT_3_2",
  ASPECT_3_4 = "ASPECT_3_4",
  ASPECT_4_3 = "ASPECT_4_3",
  ASPECT_9_16 = "ASPECT_9_16",
}

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

interface StrategyContext {
  message: string;
  img: File | null;
  apiKey: string;
  useCredits: boolean;
}

type GenerationStrategy = (context: StrategyContext) => Promise<ArrayBuffer | Buffer>;

const strategies: Record<string, GenerationStrategy> = {
  "dall-e": async ({ message, img, apiKey, useCredits }) => {
    let apiUrl: string;
    let body: any;
    let formData: FormData | undefined;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
    };

    if (img) {
      formData = new FormData();
      formData.append("image", img);
      formData.append("prompt", message);
      formData.append("n", "1");
      formData.append("size", "1024x1024");
      apiUrl = `https://api.openai.com/v1/images/edits`;
    } else {
      apiUrl = `https://api.openai.com/v1/images/generations`;
      body = {
        prompt: message,
        n: 1,
        size: "1024x1024",
      };
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData || JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error from DALL-E API: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DalleResponse;
    const imageUrl = data.data[0].url;
    return await fetch(imageUrl).then((res) => res.arrayBuffer());
  },

  "stable-diffusion-xl": async ({ message, img, apiKey }) => {
    let apiUrl: string;
    let body: any;
    let formData: FormData | undefined;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/jpeg",
    };

    if (img) {
      formData = new FormData();
      formData.append("init_image", img);
      formData.append("prompt", message);
      formData.append("init_image_mode", "IMAGE_STRENGTH");
      formData.append("image_strength", "0.5");
      formData.append("cfg_scale", "7");
      formData.append("seed", "1");
      formData.append("steps", "30");
      formData.append("safety_check", "false");
      apiUrl = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image";
    } else {
      apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
      body = {
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        seed: 0,
        safety_check: false,
        prompt: message,
      };
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData || JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error from Fireworks API: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  },

  "stability-sd3-turbo": async ({ message, img, apiKey }) => {
    const formData = new FormData();
    if (img) {
      formData.append("mode", "image-to-image");
      formData.append("image", img);
      formData.append("strength", "0.7");
    } else {
      formData.append("mode", "text-to-image");
      formData.append("aspect_ratio", "1:1");
    }
    formData.append("prompt", message);
    formData.append("output_format", "png");
    formData.append("model", "sd3-turbo");
    formData.append("isValidPrompt", "true");

    const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
    const headers = {
      Accept: "image/*",
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error from Stability API: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  },
  
  "playground-v2": async (context) => generatePlayground(context, "playground-v2-1024px-aesthetic"),
  "playground-v2-5": async (context) => generatePlayground(context, "playground-v2-1024px-aesthetic"),

  "flux-schnell": async ({ message, apiKey, useCredits }) => {
    const { default: Replicate } = await import("replicate");
    const { default: sharp } = await import("sharp");

    const replicate = new Replicate({
      auth: apiKey,
    });

    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt: message,
      },
    });

    let attemptCount = 0;
    let output;

    while (attemptCount++ < 24) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      output = await replicate.predictions.get(prediction.id);
      if (output.status !== "processing") break;
    }

    if (output?.status !== "succeeded") {
      throw new Error("Failed generating image via Replicate API.");
    }

    const webpImageData = await fetch(output.output[0]).then((res) =>
      res.arrayBuffer()
    );

    return await sharp(Buffer.from(webpImageData))
      .toFormat("jpeg")
      .toBuffer();
  },

  "ideogram-ai": async ({ message, apiKey }) => {
    const apiUrl = `https://api.ideogram.ai/generate`;

    const requestBody = {
      image_request: {
        prompt: message,
        aspect_ratio: AspectRatio.ASPECT_9_16,
        model: "V_2",
        magic_prompt_option: "AUTO",
        seed: 0,
        style_type: "AUTO",
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error from Ideogram API: ${response.status} ${response.statusText}`);
    }

    const jsonResponse = (await response.json()) as IdeogramResponse;
    const imageUrl = jsonResponse.data[0].url;
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
         throw new Error(`Error fetching Ideogram image: ${imageResponse.statusText}`);
    }
    return await imageResponse.arrayBuffer();
  },
};

// Helper for Playground models to avoid duplication
async function generatePlayground({ message, img, apiKey }: StrategyContext, modelName: string) {
    let apiUrl: string;
    let body: any;
    let formData: FormData | undefined;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/jpeg",
    };

    if (img) {
      formData = new FormData();
      formData.append("init_image", img);
      formData.append("prompt", message);
      formData.append("init_image_mode", "IMAGE_STRENGTH");
      formData.append("image_strength", "0.5");
      formData.append("cfg_scale", "7");
      formData.append("seed", "1");
      formData.append("steps", "30");
      formData.append("safety_check", "false");
      apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/${modelName}/image_to_image`;
    } else {
      apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/${modelName}`;
      body = {
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        seed: 0,
        safety_check: false,
        prompt: message,
      };
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData || JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error from Playground API: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
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
        useCredits: isUsingCredits
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
