import { apiPost } from "@/lib/api/client";

/**
 * Optimizes an image generation prompt server-side via GPT-4.
 *
 * @param prompt - The original prompt to optimize
 * @param apiKey - Optional user-supplied OpenAI key (BYOK path)
 * @returns Optimized prompt string
 * @throws Error if the API call fails
 */
export async function optimizePrompt(
  prompt: string,
  apiKey?: string
): Promise<string> {
  const result = await apiPost<string>("/api/generate/optimize-prompt", {
    prompt,
    apiKey,
  });
  if (!result.success) {
    throw new Error(result.error || "Failed to optimize prompt");
  }
  return result.data;
}

/**
 * Optimizes a prompt but falls back to the original string if optimization
 * fails. Use when you'd rather degrade gracefully than surface an error.
 */
export async function optimizePromptSafe(
  prompt: string,
  apiKey?: string
): Promise<{ optimized: string; wasOptimized: boolean }> {
  try {
    const optimized = await optimizePrompt(prompt, apiKey);
    return { optimized, wasOptimized: true };
  } catch {
    return { optimized: prompt, wasOptimized: false };
  }
}
