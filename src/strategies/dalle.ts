import { GenerationStrategy, DalleResponse } from "./types";

interface DalleGenerationRequest {
  prompt: string;
  n: number;
  size: string;
}

export const dalleStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
}) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  let apiUrl: string;
  let requestBody: FormData | string;

  if (img) {
    // Image edit mode
    const formData = new FormData();
    formData.append("image", img);
    formData.append("prompt", message);
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    apiUrl = "https://api.openai.com/v1/images/edits";
    requestBody = formData;
  } else {
    // Image generation mode
    apiUrl = "https://api.openai.com/v1/images/generations";
    headers["Content-Type"] = "application/json";
    const body: DalleGenerationRequest = {
      prompt: message,
      n: 1,
      size: "1024x1024",
    };
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(
      `Error from DALL-E API: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as DalleResponse;
  const imageUrl = data.data[0].url;

  const imageResponse = await fetch(imageUrl);
  return imageResponse.arrayBuffer();
};
