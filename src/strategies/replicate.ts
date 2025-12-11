import { GenerationStrategy } from "./types";
import { pollWithTimeout } from "@/utils/polling";

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string[];
}

export const replicateStrategy: GenerationStrategy = async ({
  message,
  apiKey,
}) => {
  const { default: Replicate } = await import("replicate");
  const { default: sharp } = await import("sharp");

  const replicate = new Replicate({ auth: apiKey });

  const prediction = await replicate.predictions.create({
    model: "black-forest-labs/flux-schnell",
    input: { prompt: message },
  });

  // Poll until prediction completes
  const result = await pollWithTimeout<ReplicatePrediction>(
    () =>
      replicate.predictions.get(prediction.id) as Promise<ReplicatePrediction>,
    (output) => output.status !== "processing",
    { maxAttempts: 24, intervalMs: 5000 }
  );

  if (result.status !== "succeeded" || !result.output?.[0]) {
    throw new Error("Failed generating image via Replicate API.");
  }

  // Convert WebP to JPEG
  const webpImageData = await fetch(result.output[0]).then((res) =>
    res.arrayBuffer()
  );

  return await sharp(Buffer.from(webpImageData)).toFormat("jpeg").toBuffer();
};
