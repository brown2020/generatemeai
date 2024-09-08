"use server";

import { adminBucket } from "@/firebase/firebaseAdmin";
import * as dotenv from "dotenv";

dotenv.config();

export async function generateImage(message: string, uid: string) {
  try {
    const apiUrl = `https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`;
    const requestBody = {
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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "image/jpeg",
        Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Error from Fireworks API: ${response.status} ${response.statusText}`
      );
    }

    const imageData = await response.arrayBuffer();
    const fileName = `generated/${uid}/${Date.now()}.jpg`;
    const file = adminBucket.file(fileName);

    await file.save(Buffer.from(imageData), {
      contentType: "image/jpeg",
    });

    const [imageUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-17-2125",
    });

    return { imageUrl };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error generating image:", errorMessage);
    return { error: errorMessage };
  }
}
