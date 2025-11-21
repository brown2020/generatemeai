import { GenerationStrategy } from "./types";

export const replicateStrategy: GenerationStrategy = async ({
  message,
  apiKey,
}) => {
  const { default: Replicate } = await import("replicate");
  const { default: sharp } = await import("sharp");

  const replicate = new Replicate({
    auth: apiKey,
  });

  const prediction = await replicate.predictions.create({
    model: "black-forest-labs/flux-schnell",
    input: {
      prompt: message,
    },
  });

  let attemptCount = 0;
  let output;

  while (attemptCount++ < 24) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    output = await replicate.predictions.get(prediction.id);
    if (output.status !== "processing") break;
  }

  if (output?.status !== "succeeded") {
    throw new Error("Failed generating image via Replicate API.");
  }

  // output.output[0] is the URL
  const webpImageData = await fetch(output.output[0]).then((res) =>
    res.arrayBuffer()
  );

  return await sharp(Buffer.from(webpImageData)).toFormat("jpeg").toBuffer();
};

