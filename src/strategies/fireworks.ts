import { GenerationStrategy, StrategyContext } from "./types";

export const fireworksStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
}) => {
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
    apiUrl =
      "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0/image_to_image";
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
    throw new Error(
      `Error from Fireworks API: ${response.status} ${response.statusText}`
    );
  }

  return await response.arrayBuffer();
};

export const generatePlayground = async (
  { message, img, apiKey }: StrategyContext,
  modelName: string
) => {
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
    throw new Error(
      `Error from Playground API: ${response.status} ${response.statusText}`
    );
  }

  return await response.arrayBuffer();
};

export const playgroundV2Strategy: GenerationStrategy = async (context) =>
  generatePlayground(context, "playground-v2-1024px-aesthetic");

export const playgroundV25Strategy: GenerationStrategy = async (context) =>
  generatePlayground(context, "playground-v2-1024px-aesthetic");

