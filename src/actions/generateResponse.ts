"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { ModelMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { authenticateAction } from "@/utils/serverAuth";
import { AuthenticationError, errorResult } from "@/utils/errors";

export async function generateResponse(
  systemPrompt: string,
  userPrompt: string
) {
  try {
    await authenticateAction();

    if (!systemPrompt || !userPrompt) {
      return errorResult(
        "System prompt and user prompt are required.",
        "INVALID_INPUT"
      );
    }

    const model = openai("gpt-4o");

    const messages: ModelMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const result = streamText({ model, messages });

    const stream = createStreamableValue(result.textStream);
    return stream.value;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResult(error.message, "AUTHENTICATION_REQUIRED");
    }
    const msg = error instanceof Error ? error.message : "An unknown error occurred";
    return errorResult(msg, "GENERATION_FAILED");
  }
}
