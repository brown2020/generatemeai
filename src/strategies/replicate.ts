import { GenerationStrategy } from "./types";
import { pollWithTimeout } from "@/utils/polling";

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string | string[];
}

export const replicateStrategy: GenerationStrategy = async ({
  message,
  apiKey,
  aspectRatio,
}) => {
  const { default: Replicate } = await import("replicate");

  const replicate = new Replicate({ auth: apiKey });

  const prediction = await replicate.predictions.create({
    model: "black-forest-labs/flux-2-pro",
    input: {
      prompt: message,
      aspect_ratio: aspectRatio || "1:1",
      output_format: "jpeg",
      output_quality: 90,
    },
  });

  // Poll until prediction completes
  const result = await pollWithTimeout<ReplicatePrediction>(
    () =>
      replicate.predictions.get(prediction.id) as Promise<ReplicatePrediction>,
    (output) => output.status !== "processing" && output.status !== "starting",
    { maxAttempts: 30, intervalMs: 5000 }
  );

  if (result.status !== "succeeded" || !result.output) {
    throw new Error("Failed generating image via Replicate API.");
  }

  // FLUX.2 [pro] returns a single URL or an array with one URL
  const outputUrl = Array.isArray(result.output)
    ? result.output[0]
    : result.output;

  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to fetch generated image: ${imageResponse.status} ${imageResponse.statusText}`
    );
  }

  return imageResponse.arrayBuffer();
};
