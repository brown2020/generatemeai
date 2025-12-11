"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getErrorMessage } from "./errors";

const SYSTEM_PROMPT = `You are an expert at writing prompts for AI image generation. 
Optimize the given prompt to produce better results. 
Keep the core idea but enhance it with better descriptive language and relevant artistic details. 
Return only the optimized prompt without any explanation or quotation marks.`;

/**
 * Optimizes an image generation prompt using GPT-4.
 *
 * @param prompt - The original prompt to optimize
 * @param apiKey - OpenAI API key (uses env key if not provided)
 * @returns Optimized prompt string
 * @throws Error if optimization fails
 *
 * @example
 * const optimized = await optimizePrompt("a cat sitting", myApiKey);
 * // Returns: "A majestic tabby cat sitting gracefully on a sunlit windowsill..."
 */
export const optimizePrompt = async (
  prompt: string,
  apiKey?: string
): Promise<string> => {
  try {
    const resolvedKey = apiKey || process.env.OPENAI_API_KEY;

    if (!resolvedKey) {
      throw new Error("OpenAI API key is required for prompt optimization");
    }

    const openai = createOpenAI({ apiKey: resolvedKey });

    const { text } = await generateText({
      model: openai("gpt-4"),
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    // Clean up the response
    return text.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw new Error(`Failed to optimize prompt: ${getErrorMessage(error)}`);
  }
};

/**
 * Optimizes a prompt with a fallback to the original if optimization fails.
 * Use this when you want to gracefully handle failures.
 */
export const optimizePromptSafe = async (
  prompt: string,
  apiKey?: string
): Promise<{ optimized: string; wasOptimized: boolean }> => {
  try {
    const optimized = await optimizePrompt(prompt, apiKey);
    return { optimized, wasOptimized: true };
  } catch {
    return { optimized: prompt, wasOptimized: false };
  }
};
