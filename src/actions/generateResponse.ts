"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { authenticateAction } from "@/utils/serverAuth";

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string
) {
  // Authenticate server-side
  await authenticateAction();

  if (!systemPrompt || !userPrompt) {
    throw new Error("System prompt and user prompt are required.");
  }

  const model = openai("gpt-4o");

  const messages: ModelMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const result = streamText({
    model,
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
