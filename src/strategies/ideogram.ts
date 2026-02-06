import { GenerationStrategy, AspectRatio, IdeogramResponse } from "./types";

/**
 * Maps standard aspect ratios to Ideogram's enum format.
 */
const toIdeogramAspectRatio = (ratio?: string): AspectRatio => {
  const map: Record<string, AspectRatio> = {
    "1:1": AspectRatio.ASPECT_1_1,
    "16:9": AspectRatio.ASPECT_16_9,
    "9:16": AspectRatio.ASPECT_9_16,
    "4:3": AspectRatio.ASPECT_4_3,
    "3:4": AspectRatio.ASPECT_3_4,
    "3:2": AspectRatio.ASPECT_3_2,
    "2:3": AspectRatio.ASPECT_2_3,
  };
  return map[ratio || ""] || AspectRatio.ASPECT_1_1;
};

export const ideogramStrategy: GenerationStrategy = async ({
  message,
  apiKey,
  aspectRatio,
  negativePrompt,
}) => {
  const apiUrl = `https://api.ideogram.ai/generate`;

  const requestBody = {
    image_request: {
      prompt: message,
      ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
      aspect_ratio: toIdeogramAspectRatio(aspectRatio),
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
    throw new Error(
      `Error from Ideogram API: ${response.status} ${response.statusText}`
    );
  }

  const jsonResponse = (await response.json()) as IdeogramResponse;
  const imageUrl = jsonResponse.data[0].url;
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Error fetching Ideogram image: ${imageResponse.statusText}`
    );
  }
  return await imageResponse.arrayBuffer();
};

