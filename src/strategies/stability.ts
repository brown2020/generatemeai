import { GenerationStrategy } from "./types";

export const stabilityStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
  aspectRatio,
  negativePrompt,
}) => {
  const formData = new FormData();
  if (img) {
    formData.append("mode", "image-to-image");
    formData.append("image", img);
    formData.append("strength", "0.7");
  } else {
    formData.append("mode", "text-to-image");
    formData.append("aspect_ratio", aspectRatio || "1:1");
  }
  formData.append("prompt", message);
  if (negativePrompt) {
    formData.append("negative_prompt", negativePrompt);
  }
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
    throw new Error(
      `Error from Stability API: ${response.status} ${response.statusText}`
    );
  }

  return await response.arrayBuffer();
};

