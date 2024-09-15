"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import { model } from "@/types/model";
import * as dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

export async function generateImage(
  message: string,
  uid: string,
  openAPIKey: string,
  fireworksAPIKey: string,
  stabilityAPIKey: string,
  useCredits: boolean,
  credits: number,
  model: model,
  overlayText: string
) {
  try {
    if (useCredits && credits < 2) {
      throw new Error("Not enough credits to generate an image. Please purchase credits or use your own API keys.");
    }

    let apiUrl, requestBody, formData, headers;

    if (model == 'dall-e') {
      apiUrl = `https://api.openai.com/v1/images/generations`;
      requestBody = {
        prompt: message,
        n: 1,
        size: "1024x1024"
      };
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useCredits ? process.env.OPENAI_API_KEY : openAPIKey}`,
      };
    } else if (model == 'stable-diffusion-xl') {
      apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
      requestBody = {
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        sampler: null,
        samples: 1,
        steps: 30,
        seed: 0,
        style_preset: null,
        safety_check: false,
        prompt: message,
      };
      headers = {
        "Content-Type": "application/json",
        Accept: "image/jpeg",
        Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
      };
    } else if (model == 'stability-sd3-turbo') {
      formData = new FormData();
      formData.append("mode", "text-to-image");
      formData.append("prompt", message);
      formData.append("aspect_ratio", "1:1");
      formData.append("output_format", "png");
      formData.append("model", "sd3-turbo");
      formData.append("isValidPrompt", "true");

      apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";
      headers = {
        Accept: "image/*",
        Authorization: `Bearer ${useCredits ? process.env.STABILITY_API_KEY : stabilityAPIKey}`,
      };
    } else if (model == 'playground-v2') {
      apiUrl = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/playground-v2-1024px-aesthetic";
      requestBody = {
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        sampler: null,
        samples: 1,
        steps: 30,
        seed: 0,
        style_preset: null,
        safety_check: false,
        prompt: message,
      };
      headers = {
        "Content-Type": "application/json",
        Accept: "image/jpeg",
        Authorization: `Bearer ${useCredits ? process.env.FIREWORKS_API_KEY : fireworksAPIKey}`,
      };
    }

    if (apiUrl) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: model != 'stability-sd3-turbo' ? JSON.stringify(requestBody) : formData,
      });

      if (!response.ok) {
        throw new Error(`Error from Image API: ${response.status} ${response.statusText}`);
      }

      const imageData = model == "dall-e"
        ? await fetch((await response.json()).data[0].url).then(res => res.arrayBuffer())
        : await response.arrayBuffer();

      let finalImage = Buffer.from(imageData);
      if (overlayText) {
        finalImage = await sharp(finalImage)
          .composite([
            {
              input: Buffer.from(
                `<svg width="1024" height="1024">
                 <rect x="0" y="450" width="1024" height="150" fill="rgba(0, 0, 0, 0.7)"/>
                 <text x="50%" y="525" font-size="48" fill="white" text-anchor="middle">${overlayText}</text>
               </svg>`
              ),
              gravity: 'center'
            }
          ])
          .toBuffer();
      }

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

      const [imageUrl] = await file.getSignedUrl({
        action: "read",
        expires: "03-17-2125",
      });

      return { imageUrl };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image:", error);
    return { error: errorMessage };
  }
}
