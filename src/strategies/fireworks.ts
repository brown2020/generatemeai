import { GenerationStrategy, StrategyContext } from "./types";

/**
 * Creates a Fireworks AI generation strategy for a specific model.
 * This factory function eliminates code duplication across different Fireworks models.
 */
const createFireworksStrategy = (modelName: string): GenerationStrategy => {
  return async ({ message, img, apiKey, aspectRatio, imageCount }: StrategyContext) => {
    const baseUrl =
      "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models";

    const { getAspectRatioDimensions } = await import("@/constants/modelRegistry");
    const { width, height } = getAspectRatioDimensions(aspectRatio || "1:1");
    const count = imageCount || 1;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/jpeg",
    };

    let apiUrl: string;
    let body: string | FormData;

    if (img) {
      const formData = new FormData();
      formData.append("init_image", img);
      formData.append("prompt", message);
      formData.append("init_image_mode", "IMAGE_STRENGTH");
      formData.append("image_strength", "0.5");
      formData.append("cfg_scale", "7");
      formData.append("seed", "1");
      formData.append("steps", "30");
      formData.append("safety_check", "false");

      apiUrl = `${baseUrl}/${modelName}/image_to_image`;
      body = formData;
    } else {
      apiUrl = `${baseUrl}/${modelName}`;
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({
        cfg_scale: 7,
        height,
        width,
        samples: count,
        steps: 30,
        seed: 0,
        safety_check: false,
        prompt: message,
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Error from Fireworks API (${modelName}): ${response.status} ${response.statusText}`
      );
    }

    return await response.arrayBuffer();
  };
};

// Pre-configured strategies for different models
export const fireworksStrategy = createFireworksStrategy(
  "stable-diffusion-xl-1024-v1-0"
);
export const playgroundV2Strategy = createFireworksStrategy(
  "playground-v2-1024px-aesthetic"
);
export const playgroundV25Strategy = createFireworksStrategy(
  "playground-v2-5-1024px-aesthetic"
);
