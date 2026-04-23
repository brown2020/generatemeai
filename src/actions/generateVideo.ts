import { apiPostForm } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

interface VideoGenerationData {
  videoUrl: string;
}

/**
 * Generates a video (D-ID or RunwayML) from a source image. Accepts a
 * FormData payload to match the existing call-site shape in
 * VideoModalComponent.
 */
export function generateVideo(
  data: FormData
): Promise<ActionResult<VideoGenerationData>> {
  return apiPostForm<VideoGenerationData>("/api/generate/video", data);
}
