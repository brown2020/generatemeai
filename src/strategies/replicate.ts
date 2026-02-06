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
  aspectRatio,
  imageCount,
}) => {
  const { default: Replicate } = await import("replicate");
  const { default: sharp } = await import("sharp");
  const { getAspectRatioDimensions } = await import("@/constants/modelRegistry");

  const replicate = new Replicate({ auth: apiKey });
  const { width, height } = getAspectRatioDimensions(aspectRatio || "1:1");
  const count = imageCount || 1;

  const prediction = await replicate.predictions.create({
    model: "black-forest-labs/flux-schnell",
    input: {
      prompt: message,
      width,
      height,
      num_outputs: count,
    },
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

  // Convert each output from WebP to JPEG
  if (count > 1 && result.output.length > 1) {
    const buffers = await Promise.all(
      result.output.map(async (url: string) => {
        const data = await fetch(url).then((res) => res.arrayBuffer());
        return await sharp(Buffer.from(data)).toFormat("jpeg").toBuffer();
      })
    );
    return buffers;
  }

  const webpImageData = await fetch(result.output[0]).then((res) =>
    res.arrayBuffer()
  );
  return await sharp(Buffer.from(webpImageData)).toFormat("jpeg").toBuffer();
};
