"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { creditsToMinus } from "@/utils/credits";
import { ActionResult, successResult, errorResult } from "@/utils/errors";

interface SuggestTagsParams {
  freestyle: string;
  color: string;
  lighting: string;
  style: string;
  imageCategory: string;
  tags: string[];
  openAPIKey: string;
  useCredits: boolean;
  credits: number;
}

/**
 * Builds the prompt for tag suggestion based on image parameters.
 */
function buildTagSuggestionPrompt(
  params: Omit<SuggestTagsParams, "openAPIKey" | "useCredits" | "credits">
): string {
  const { freestyle, color, lighting, style, imageCategory, tags } = params;

  const parts = [`the prompt: ${freestyle}`];

  if (color && color !== "None") parts.push(`color: ${color}`);
  if (lighting && lighting !== "None") parts.push(`lighting: ${lighting}`);
  if (style) parts.push(`style: ${style}`);
  if (imageCategory) parts.push(`ImageCategory: ${imageCategory}`);

  return `Using this prompt that image created with

${parts.join(", ")}

Suggest tags for the image. It shouldn't be from this list: ${tags.join(", ")}. 
Please list the tags in this format: separate all tags with commas, that's it, nothing else, and don't use a full stop at the end. Provide only 6 suggestions, no explanation.`;
}

/**
 * Suggests tags for an image based on its generation parameters.
 * Uses Vercel AI SDK for cleaner API integration.
 *
 * @returns ActionResult with suggested tags string or error
 */
export const suggestTags = async (
  freestyle: string,
  color: string,
  lighting: string,
  style: string,
  imageCategory: string,
  tags: string[],
  openAPIKey: string,
  useCredits: boolean,
  credits: number
): Promise<ActionResult<string>> => {
  try {
    // Check credits
    if (useCredits && credits < creditsToMinus("chatgpt")) {
      return errorResult(
        "Not enough credits to suggest tags. Please purchase credits or use your own API Keys.",
        "INSUFFICIENT_CREDITS"
      );
    }

    // Determine API key to use
    const apiKey = useCredits ? process.env.OPENAI_API_KEY! : openAPIKey;

    // Create OpenAI provider instance
    const openai = createOpenAI({ apiKey });

    // Build the prompt
    const prompt = buildTagSuggestionPrompt({
      freestyle,
      color,
      lighting,
      style,
      imageCategory,
      tags,
    });

    // Generate text using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4"),
      system:
        "For all responses, reply with just the answer without giving any description.",
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    return successResult(text);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error suggesting tags:", error);
    return errorResult(errorMessage);
  }
};
