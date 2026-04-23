import { GenerationStrategy } from "./types";

const MODEL = "gpt-image-2";

/**
 * Maps standard aspect ratios to a gpt-image-2 `size` value.
 *
 * gpt-image-2 accepts thousands of valid resolutions, but we pin to the
 * three well-tested sizes (square, landscape, portrait) for predictable
 * cost and latency. "auto" is also valid — pass that via the UI if you
 * want the model to choose.
 */
const getSize = (ratio?: string): string => {
  switch (ratio) {
    case "16:9":
    case "4:3":
    case "3:2":
      return "1536x1024";
    case "9:16":
    case "3:4":
    case "2:3":
      return "1024x1536";
    default:
      return "1024x1024";
  }
};

interface GptImageResponse {
  data: Array<{ b64_json?: string; url?: string }>;
}

export const dalleStrategy: GenerationStrategy = async ({
  message,
  img,
  apiKey,
  aspectRatio,
  imageCount,
}) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  let apiUrl: string;
  let requestBody: FormData | string;

  if (img) {
    // Image edit mode — gpt-image-2 processes all inputs at high fidelity
    // automatically, so input_fidelity is not sent.
    const formData = new FormData();
    formData.append("model", MODEL);
    formData.append("image[]", img);
    formData.append("prompt", message);
    formData.append("size", getSize(aspectRatio));
    apiUrl = "https://api.openai.com/v1/images/edits";
    requestBody = formData;
  } else {
    apiUrl = "https://api.openai.com/v1/images/generations";
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify({
      model: MODEL,
      prompt: message,
      n: imageCount || 1,
      size: getSize(aspectRatio),
      quality: "auto",
    });
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(
      `Error from OpenAI GPT Image API: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as GptImageResponse;

  // gpt-image-2 returns b64_json by default.
  const buffers = data.data.map((item) => {
    if (item.b64_json) {
      return Buffer.from(item.b64_json, "base64");
    }
    throw new Error("Unexpected response format from OpenAI GPT Image API");
  });

  return buffers.length === 1 ? buffers[0] : buffers;
};
