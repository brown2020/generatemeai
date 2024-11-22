"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import { creditsToMinus } from "@/utils/credits";
import { File } from "formdata-node";
import fetch from "node-fetch";

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
  style_preset?: string;
  safety_check?: boolean;
  sampler?: string;
  input?: {
    text: string;
  };
  version?: string;
  // Ideogram-specific fields
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
    //  resolution?:
    //    | "RESOLUTION_1120_896"
    //    | "RESOLUTION_1152_704"
    //    | "RESOLUTION_1152_768"
    //    | "RESOLUTION_1152_832"
    //    | "RESOLUTION_1152_864"
    //    | "RESOLUTION_1152_896"
    //    | "RESOLUTION_1216_704"
    //    | "RESOLUTION_1216_768"
    //    | "RESOLUTION_1216_832"
    //    | "RESOLUTION_1232_768"
    //    | "RESOLUTION_1024_1024"
    //    | "RESOLUTION_1024_640"
    //    | "RESOLUTION_1024_768"
    //    | "RESOLUTION_1024_832"
    //    | "RESOLUTION_1024_896"
    //    | "RESOLUTION_1024_960"
    //    | "RESOLUTION_1088_768"
    //    | "RESOLUTION_1088_832"
    //    | "RESOLUTION_1088_896"
    //    | "RESOLUTION_1088_960"
    //    | "RESOLUTION_1248_832"
    //    | "RESOLUTION_1280_704"
    //    | "RESOLUTION_1280_720"
    //    | "RESOLUTION_1280_768"
    //    | "RESOLUTION_1280_800"
    //    | "RESOLUTION_1312_736"
    //    | "RESOLUTION_1344_640"
    //    | "RESOLUTION_1344_704"
    //    | "RESOLUTION_1344_768"
    //    | "RESOLUTION_1408_576"
    //    | "RESOLUTION_1408_640"
    //    | "RESOLUTION_1408_704"
    //    | "RESOLUTION_1472_576"
    //    | "RESOLUTION_1472_640"
    //    | "RESOLUTION_1472_704"
    //    | "RESOLUTION_1536_512"
    //    | "RESOLUTION_1536_576"
    //    | "RESOLUTION_1536_640"
    //    | "RESOLUTION_512_1536"
    //    | "RESOLUTION_576_1408"
    //    | "RESOLUTION_576_1472"
    //    | "RESOLUTION_576_1536"
    //    | "RESOLUTION_640_1024"
    //    | "RESOLUTION_640_1344"
    //    | "RESOLUTION_640_1408"
    //    | "RESOLUTION_640_1472"
    //    | "RESOLUTION_640_1536"
    //    | "RESOLUTION_704_1152"
    //    | "RESOLUTION_704_1216"
    //    | "RESOLUTION_704_1280"
    //    | "RESOLUTION_704_1344"
    //    | "RESOLUTION_704_1408"
    //    | "RESOLUTION_704_1472"
    //    | "RESOLUTION_720_1280"
    //    | "RESOLUTION_736_1312"
    //    | "RESOLUTION_768_1024"
    //    | "RESOLUTION_768_1088"
    //    | "RESOLUTION_768_1152"
    //    | "RESOLUTION_768_1216"
    //    | "RESOLUTION_768_1232"
    //    | "RESOLUTION_768_1280"
    //    | "RESOLUTION_768_1344"
    //    | "RESOLUTION_832_1024"
    //    | "RESOLUTION_832_1088"
    //    | "RESOLUTION_832_1152"
    //    | "RESOLUTION_832_1216"
    //    | "RESOLUTION_832_1248"
    //    | "RESOLUTION_832_960"
    //    | "RESOLUTION_864_1152"
    //    | "RESOLUTION_896_1024"
    //    | "RESOLUTION_896_1088"
    //    | "RESOLUTION_896_1120"
    //    | "RESOLUTION_896_1152"
    //    | "RESOLUTION_896_960"
    //    | "RESOLUTION_960_1024"
    //    | "RESOLUTION_960_1088"
    //    | "RESOLUTION_960_832"
    //    | "RESOLUTION_960_896";
    negative_prompt?: string;
    //  color_palette?: object;
  };
}

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

// Function to check credits
const checkCredits = (
  useCredits: boolean | null,
  credits: string | null,
  model: string | null
) => {
  if (
    useCredits &&
    credits &&
    Number(credits) < creditsToMinus(model as model)
  ) {
    throw new Error(
      "Not enough credits to generate an video. Please purchase credits or use your own API keys."
    );
  }
};

// Enum for aspect ratios of Ideogram
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

// Main function to generate the image
export async function generateImage(data: FormData) {
  try {
    const message = data.get("message") as string | null;
    const uid = data.get("uid") as string | null;
    const openAPIKey = data.get("openAPIKey") as string | null;
    const fireworksAPIKey = data.get("fireworksAPIKey") as string | null;
    const stabilityAPIKey = data.get("stabilityAPIKey") as string | null;
    const replicateAPIKey = data.get("replicateAPIKey") as string | null;
    const useCredits = data.get("useCredits") as boolean | null;
    const credits = data.get("credits") as string | null;
    const model = data.get("model") as string | null;
    const img: File | null = data.get("imageField") as File | null;

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
        formData.append("prompt", message!);
        formData.append("n", "1");
        formData.append("size", "1024x1024");

        apiUrl = `https://api.openai.com/v1/images/edits`;
        headers = {
          Authorization: `Bearer ${
            useCredits ? process.env.OPENAI_API_KEY! : openAPIKey!
          }`,
        };
      } else {
        apiUrl = `https://api.openai.com/v1/images/generations`;
        requestBody = {
          prompt: message!,
          n: 1,
          size: "1024x1024",
        };
        headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            useCredits ? process.env.OPENAI_API_KEY! : openAPIKey!
          }`,
        };
      }
    }
    // Handling for Stable Diffusion XL Model
    else if (model === "stable-diffusion-xl") {
      if (img) {
        formData = new FormData();
        formData.append("init_image", img);
        formData.append("prompt", message!);
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
            useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
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
          prompt: message!,
        };
        headers = {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
          }`,
        };
      }
    }
    // Handling for Stability SD3 Turbo Model
    else if (model === "stability-sd3-turbo") {
      formData = new FormData();
      if (img) {
        formData.append("mode", "image-to-image");
        formData.append("image", img);
        formData.append("strength", "0.7");
      } else {
        formData.append("mode", "text-to-image");
        formData.append("aspect_ratio", "1:1");
      }
      formData.append("prompt", message!);
      formData.append("output_format", "png");
      formData.append("model", "sd3-turbo");
      formData.append("isValidPrompt", "true");

      apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
      headers = {
        Accept: "image/*",
        Authorization: `Bearer ${
          useCredits ? process.env.STABILITY_API_KEY! : stabilityAPIKey!
        }`,
      };
    }
    // Handling for Playground V2 Model
    else if (model === "playground-v2" || model === "playground-v2-5") {
      if (img) {
        formData = new FormData();
        formData.append("init_image", img);
        formData.append("prompt", message!);
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
            useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
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
          prompt: message!,
        };
        headers = {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${
            useCredits ? process.env.FIREWORKS_API_KEY! : fireworksAPIKey!
          }`,
        };
      }
    } else if (model === "flux-schnell") {
      const { default: Replicate } = await import("replicate");
      const { default: sharp } = await import("sharp");

      const replicate = new Replicate({
        auth: useCredits ? process.env.REPLICATE_API_KEY! : replicateAPIKey!,
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
        if (output.status != "processing") break;
      }

      if (output?.status != "succeeded") {
        throw new Error("Failed generating image via Replicate API.");
      }

      const webpImageData = await fetch(output.output[0]).then((res) =>
        res.arrayBuffer()
      );

      imageData = await sharp(Buffer.from(webpImageData))
        .toFormat("jpeg")
        .toBuffer();
    }

    // Handling for Ideogram
    if (model === "ideogram-ai") {
      apiUrl = `https://api.ideogram.ai/generate`;

      requestBody = {
        image_request: {
          prompt: message!,
          aspect_ratio: AspectRatio.ASPECT_9_16,
          model: "V_2",
          magic_prompt_option: "AUTO",
          seed: 0,
          style_type: "AUTO",
        },
      };

      headers = {
        "Content-Type": "application/json",
        "Api-Key": process.env.IDEOGRAM_API_KEY!,
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
        const dalleResponse: DalleResponse =
          (await response.json()) as DalleResponse;
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
      const finalImage = Buffer.from(imageData);

      // Save the generated image to Firebase
      const fileName = `generated/${uid}/${Date.now()}.jpg`;
      const file = adminBucket.file(fileName);

      await file.save(finalImage, {
        contentType: "image/jpeg",
      });

      const metadata = {
        metadata: {
          prompt: message!,
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
