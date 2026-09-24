import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { errorToResponse, jsonError, jsonOk, parseJsonBody, withAuth } from "@/lib/api/server";
import {
  assertSufficientCreditsServer,
  deductCreditsServer,
  refundCreditsServer,
} from "@/utils/creditValidator";
import { creditsToMinus, resolveApiKey } from "@/constants/modelRegistry";

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
 * Rewrites a prompt with gpt-5.6-sol. Platform credits reserve the platform key.
 * Bring-your-own-key calls require the caller's key and do not touch that key.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const [{ prompt, apiKey: userApiKey }, { useCredits }] = await Promise.all([
    parseJsonBody(request, bodySchema),
    assertSufficientCreditsServer(uid, "chatgpt"),
  ]);
  const apiKey = resolveApiKey("chatgpt", useCredits, userApiKey);

  if (!apiKey) {
    return jsonError("OpenAI API key is required.", "INVALID_API_KEY", 400);
  }

  let chargedAmount = 0;
  try {
    if (useCredits) {
      const cost = creditsToMinus("chatgpt");
      await deductCreditsServer(uid, cost);
      chargedAmount = cost;
    }

    const openai = createOpenAI({ apiKey });
    const { text } = await generateText({
      model: openai("gpt-5.6-sol"),
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 200,
      temperature: 0.7,
      providerOptions: { openai: { reasoningEffort: "none" } },
    });

    chargedAmount = 0;
    return jsonOk(text.trim().replace(/^["']|["']$/g, ""));
  } catch (error) {
    if (chargedAmount > 0) {
      try {
        await refundCreditsServer(uid, chargedAmount);
      } catch (refundError) {
        console.error("[api] credit refund failed", refundError);
      }
    }
    return errorToResponse(error);
  }
});
