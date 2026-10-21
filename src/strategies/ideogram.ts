import { GenerationStrategy, IdeogramResponse } from "./types";

/**
 * Maps standard aspect ratios to Ideogram 3.0 format.
 */
const toIdeogramV3AspectRatio = (ratio?: string): string => {
  const map: Record<string, string> = {
    "1:1": "1x1",
    "16:9": "16x9",
    "9:16": "9x16",
    "4:3": "4x3",
    "3:4": "3x4",
    "3:2": "3x2",
    "2:3": "2x3",
  };
  return map[ratio || ""] || "1x1";
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

  if (!jsonResponse.data?.length || !jsonResponse.data[0]?.url) {
    throw new Error("Ideogram API returned no image data");
  }

  const imageUrl = jsonResponse.data[0].url;
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(
      `Error fetching Ideogram image: ${imageResponse.statusText}`
    );
  }
  return await imageResponse.arrayBuffer();
};
