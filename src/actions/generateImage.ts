import type { ActionResult, ErrorCode } from "@/utils/errors";

interface ImageGenerationData {
  imageUrl: string;
  imageUrls: string[];
  imageReference?: string;
}

/**
 * Events yielded by the streaming image generator. Consumers pattern-match
 * on `status` to drive progress UI and handle terminal outcomes.
 */
export type ImageGenerationEvent =
  | { status: "started" }
  | { status: "generating" }
  | { status: "uploading"; uploaded: number; total: number }
  | { status: "complete"; data: ImageGenerationData }
  | { status: "error"; error: string; code?: ErrorCode };

/**
 * Generates image(s) and yields progress events over an NDJSON stream.
 * Consumers should await the async iterator and react to each event;
 * terminal events are either `complete` or `error`.
 */
export async function* generateImageStream(
  data: FormData,
  signal?: AbortSignal
): AsyncGenerator<ImageGenerationEvent, void, unknown> {
  let response: Response;
  try {
    response = await fetch("/api/generate/image", {
      method: "POST",
      body: data,
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    yield {
      status: "error",
      error: error instanceof Error ? error.message : "Network request failed",
      code: "NETWORK_ERROR",
    };
    return;
  }

  if (!response.ok || !response.body) {
    yield {
      status: "error",
      error: `Unexpected response (${response.status} ${response.statusText})`,
      code: "GENERATION_FAILED",
    };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const raw = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        if (!raw) continue;
        try {
          yield JSON.parse(raw) as ImageGenerationEvent;
        } catch {
          // Tolerate partial/invalid frames — keep reading.
        }
      }
    }
    // Flush any trailing partial line (final events without newline).
    const tail = buffer.trim();
    if (tail) {
      try {
        yield JSON.parse(tail) as ImageGenerationEvent;
      } catch {
        // ignore
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Compatibility wrapper matching the old `generateImage(formData)` signature.
 * Consumes the progress stream internally and returns the terminal
 * ActionResult. Use {@link generateImageStream} directly when you want to
 * surface progress to the UI.
 */
export async function generateImage(
  data: FormData
): Promise<ActionResult<ImageGenerationData>> {
  for await (const event of generateImageStream(data)) {
    if (event.status === "complete") {
      return { success: true, data: event.data };
    }
    if (event.status === "error") {
      return { success: false, error: event.error, code: event.code };
    }
  }
  return {
    success: false,
    error: "Image generation ended without a result",
    code: "GENERATION_FAILED",
  };
}
