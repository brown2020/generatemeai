"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import fetch from "node-fetch";

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

interface RequestBody {
  prompt?: string;
  n?: number;
  size?: string;
  cfg_scale?: number;
  height?: number;
  width?: number;
  samples?: number;
  steps?: number;
  seed?: number;
  safety_check?: boolean;
  image_request?: {
    prompt: string;
    aspect_ratio?: AspectRatio;
    model?: "V_1" | "V_1_TURBO" | "V_2" | "V_2_TURBO";
    magic_prompt_option?: "AUTO" | "OFF" | "ON";
    seed?: number;
    style_type?:
      | "ANIME"
      | "AUTO"
      | "DESIGN"
      | "GENERAL"
      | "REALISTIC"
      | "RENDER_3D";
  };
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
  model: string | null
) {
  if (
    useCredits === "true" &&
    credits &&
    model &&
    Number(credits) < creditsToMinus(model as model)
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
    const model = data.get("model") as string | null;
    const img = data.get("imageField") as File | null;

    if (!message || !uid || !model) {
      throw new Error("Required parameters (message, uid, model) are missing.");
    }

    checkCredits(useCredits, credits, model);

    let apiUrl: string | undefined;
    let requestBody: RequestBody | undefined;
    let formData: FormData | undefined;
    let imageData;
    let imageUrl;
    let headers: {
      [key: string]: string;
    } = {};

    if (model === "dall-e") {
      if (img) {
        formData = new FormData();
        formData.append("image", img);
        formData.append("prompt", message);
        formData.append("n", "1");
        formData.append("size", "1024x1024");

        apiUrl = `https://api.openai.com/v1/images/edits`;
        headers = {
          Authorization: `Bearer ${
            useCredits !== "true" ? process.env.OPENAI_API_KEY! : openAPIKey!
          }`,
        };
      } else {
        apiUrl = `https://api.openai.com/v1/images/generations`;
        requestBody = {
          prompt: message,
          n: 1,
          size: "1024x1024",
        };
        headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            useCredits !== "true" ? process.env.OPENAI_API_KEY! : openAPIKey!
          }`,
        };
      }
    } else if (model === "stable-diffusion-xl") {
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

        apiUrl =
          "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image";
        headers = {
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits !== "true"
              ? process.env.FIREWORKS_API_KEY!
              : fireworksAPIKey!
          }`,
        };
      } else {
        apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
        requestBody = {
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          seed: 0,
          safety_check: false,
          prompt: message,
        };
        headers = {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits !== "true"
              ? process.env.FIREWORKS_API_KEY!
              : fireworksAPIKey!
          }`,
        };
      }
    } else if (model === "stability-sd3-turbo") {
      formData = new FormData();
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

      apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
      headers = {
        Accept: "image/*",
        Authorization: `Bearer ${
          useCredits !== "true"
            ? process.env.STABILITY_API_KEY!
            : stabilityAPIKey!
        }`,
      };
    } else if (model === "playground-v2" || model === "playground-v2-5") {
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

        apiUrl =
          "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic/image_to_image";
        headers = {
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits !== "true"
              ? process.env.FIREWORKS_API_KEY!
              : fireworksAPIKey!
          }`,
        };
      } else {
        apiUrl =
          "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic";
        requestBody = {
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          seed: 0,
          safety_check: false,
          prompt: message,
        };
        headers = {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits !== "true"
              ? process.env.FIREWORKS_API_KEY!
              : fireworksAPIKey!
          }`,
        };
      }
    } else if (model === "flux-schnell") {
      const { default: Replicate } = await import("replicate");
      const { default: sharp } = await import("sharp");

      const replicate = new Replicate({
        auth:
          useCredits !== "true"
            ? process.env.REPLICATE_API_KEY!
            : replicateAPIKey!,
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

      imageData = await sharp(Buffer.from(webpImageData))
        .toFormat("jpeg")
        .toBuffer();
    } else if (model === "ideogram-ai") {
      apiUrl = `https://api.ideogram.ai/generate`;

      requestBody = {
        image_request: {
          prompt: message,
          aspect_ratio: AspectRatio.ASPECT_9_16,
          model: "V_2",
          magic_prompt_option: "AUTO",
          seed: 0,
          style_type: "AUTO",
        },
      };

      headers = {
        "Content-Type": "application/json",
        "Api-Key":
          useCredits !== "true"
            ? process.env.IDEOGRAM_API_KEY!
            : ideogramAPIKey!,
      };
    }

    // Send the request to the external API
    if ((requestBody || formData) && apiUrl) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: formData || JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Error from Image API: ${response.status} ${response.statusText}`
        );
      }

      if (model === "dall-e") {
        const dalleResponse = (await response.json()) as DalleResponse;
        const imageUrl = dalleResponse.data[0].url;
        imageData = await fetch(imageUrl).then((res) => res.arrayBuffer());
      } else if (model === "ideogram-ai") {
        const jsonResponse = (await response.json()) as IdeogramResponse;
        const imageUrl = jsonResponse.data[0].url;

        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          imageData = await imageResponse.arrayBuffer();
        }
      } else {
        imageData = await response.arrayBuffer();
      }
    }

    if (imageData) {
      // const finalImage = Buffer.from(imageData);
      // const finalImage = imageData instanceof Buffer ? imageData : Buffer.from(imageData);
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
      imageReference = Buffer.from(await img.arrayBuffer());

      const referenceFileName = `image-references/${uid}/${Date.now()}.jpg`;
      const referenceFile = adminBucket.file(referenceFileName);

      await referenceFile.save(imageReference, {
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
