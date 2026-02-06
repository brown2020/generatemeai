"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string
) {
  if (!systemPrompt || !userPrompt) {
    throw new Error("System prompt and user prompt are required.");
  }

  try {
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
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate response"
    );
  }
}
