import { GenerationStrategy, AspectRatio, IdeogramResponse } from "./types";

export const ideogramStrategy: GenerationStrategy = async ({
  message,
  apiKey,
}) => {
  const apiUrl = `https://api.ideogram.ai/generate`;

  const requestBody = {
    image_request: {
      prompt: message,
      aspect_ratio: AspectRatio.ASPECT_9_16,
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

