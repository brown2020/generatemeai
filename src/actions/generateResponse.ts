"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string
) {
  const model = openai("gpt-4o");

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const result = await streamText({
    model,
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
