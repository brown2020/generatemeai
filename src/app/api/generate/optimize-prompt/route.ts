import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  apiKey: z.string().optional(),
});

const SYSTEM_PROMPT = `You are an expert at writing prompts for AI image generation. 
Optimize the given prompt to produce better results. 
Keep the core idea but enhance it with better descriptive language and relevant artistic details. 
Return only the optimized prompt without any explanation or quotation marks.`;

/**
 * POST /api/generate/optimize-prompt
 * Rewrites a user's free-form image prompt into a richer, more descriptive
 * version via GPT-4. Uses the user's provided key (BYOK) or falls back to
 * the server-side OPENAI_API_KEY.
 */
export const POST = withAuth(async (_uid, request: NextRequest) => {
  const { prompt, apiKey } = await parseJsonBody(request, bodySchema);

  const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
  if (!resolvedKey) {
    return jsonError(
      "OpenAI API key is required for prompt optimization",
      "INVALID_API_KEY",
      400
    );
  }

  const openai = createOpenAI({ apiKey: resolvedKey });
  const { text } = await generateText({
    model: openai("gpt-4"),
    system: SYSTEM_PROMPT,
    prompt,
    maxOutputTokens: 200,
    temperature: 0.7,
  });

  return jsonOk(text.trim().replace(/^["']|["']$/g, ""));
});
