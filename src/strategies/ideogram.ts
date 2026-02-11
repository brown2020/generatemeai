import { GenerationStrategy, IdeogramResponse } from "./types";

/**
 * Maps standard aspect ratios to Ideogram 3.0 format.
 */
const toIdeogramV3AspectRatio = (ratio?: string): string => {
  const map: Record<string, string> = {
    "1:1": "ASPECT_1_1",
    "16:9": "ASPECT_16_9",
    "9:16": "ASPECT_9_16",
    "4:3": "ASPECT_4_3",
    "3:4": "ASPECT_3_4",
    "3:2": "ASPECT_3_2",
    "2:3": "ASPECT_2_3",
  };
  return map[ratio || ""] || "ASPECT_1_1";
};

export const ideogramStrategy: GenerationStrategy = async ({
  message,
  apiKey,
  aspectRatio,
  negativePrompt,
}) => {
  const apiUrl = "https://api.ideogram.ai/v1/ideogram-v3/generate";

  const formData = new FormData();
  formData.append("prompt", message);
  formData.append("aspect_ratio", toIdeogramV3AspectRatio(aspectRatio));
  formData.append("rendering_speed", "DEFAULT");
  formData.append("magic_prompt", "AUTO");
  formData.append("style_type", "AUTO");

  if (negativePrompt) {
    formData.append("negative_prompt", negativePrompt);
  }

  const headers = {
    "Api-Key": apiKey,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: formData,
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
