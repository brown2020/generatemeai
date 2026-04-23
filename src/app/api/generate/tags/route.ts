import type { NextRequest } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import { tagSuggestionSchema } from "@/utils/validationSchemas";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKey } from "@/constants/modelRegistry";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Builds the prompt for the tag-suggestion LLM call.
 */
function buildTagSuggestionPrompt(params: {
  prompt: string;
  colorScheme?: string;
  lighting?: string;
  imageStyle?: string;
  selectedCategory?: string;
  currentTags?: string[];
}): string {
  const parts = [`the prompt: ${params.prompt}`];
  if (params.colorScheme && params.colorScheme !== "None") {
    parts.push(`color: ${params.colorScheme}`);
  }
  if (params.lighting && params.lighting !== "None") {
    parts.push(`lighting: ${params.lighting}`);
  }
  if (params.imageStyle) parts.push(`style: ${params.imageStyle}`);
  if (params.selectedCategory) parts.push(`ImageCategory: ${params.selectedCategory}`);

  return `Using this prompt that image created with

${parts.join(", ")}

Suggest tags for the image. It shouldn't be from this list: ${(params.currentTags ?? []).join(", ")}. 
Please list the tags in this format: separate all tags with commas, that's it, nothing else, and don't use a full stop at the end. Provide only 6 suggestions, no explanation.`;
}

/**
 * POST /api/generate/tags
 * Suggests six image tags based on a prompt and current options.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const input = await parseJsonBody(request, tagSuggestionSchema);

  const { useCredits } = await assertSufficientCreditsServer(uid, "chatgpt");
  const apiKey = resolveApiKey("chatgpt", useCredits, input.openAPIKey);

  if (!apiKey) {
    return jsonError("OpenAI API key is required.", "INVALID_API_KEY", 400);
  }

  const openai = createOpenAI({ apiKey });
  const prompt = buildTagSuggestionPrompt({
    prompt: input.prompt,
    colorScheme: input.colorScheme,
    lighting: input.lighting,
    imageStyle: input.imageStyle,
    selectedCategory: input.selectedCategory,
    currentTags: input.currentTags,
  });

  const { text } = await generateText({
    model: openai("gpt-4"),
    system:
      "For all responses, reply with just the answer without giving any description.",
    prompt,
    maxOutputTokens: 200,
    temperature: 0.7,
  });

  if (useCredits) {
    await deductCreditsServer(uid, creditsToMinus("chatgpt"));
  }

  return jsonOk(text);
});
