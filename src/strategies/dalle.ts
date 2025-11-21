import { GenerationStrategy, DalleResponse } from "./types";

export const dalleStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
}) => {
  let apiUrl: string;
  let body: any;
  let formData: FormData | undefined;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  if (img) {
    formData = new FormData();
    formData.append("image", img);
    formData.append("prompt", message);
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    apiUrl = `https://api.openai.com/v1/images/edits`;
  } else {
    apiUrl = `https://api.openai.com/v1/images/generations`;
    body = {
      prompt: message,
      n: 1,
      size: "1024x1024",
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
      `Error from DALL-E API: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as DalleResponse;
  const imageUrl = data.data[0].url;
  return await fetch(imageUrl).then((res) => res.arrayBuffer());
};

