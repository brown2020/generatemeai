import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

/**
 * Toggles the shareable status of an image.
 */
export function toggleImageSharable(
  imageId: string,
  password: string = ""
): Promise<ActionResult<{ isSharable: boolean }>> {
  return apiPost<{ isSharable: boolean }>(
    `/api/images/${encodeURIComponent(imageId)}/share`,
    { password }
  );
}

export function deleteImage(imageId: string): Promise<ActionResult<void>> {
  return apiDelete<void>(`/api/images/${encodeURIComponent(imageId)}`);
}

export function updateImageCaption(
  imageId: string,
  caption: string
): Promise<ActionResult<void>> {
  return apiPatch<void>(`/api/images/${encodeURIComponent(imageId)}`, {
    caption: caption || "",
  });
}

export function updateImageBackground(
  imageId: string,
  color: string
): Promise<ActionResult<void>> {
  return apiPatch<void>(`/api/images/${encodeURIComponent(imageId)}`, {
    backgroundColor: color,
  });
}

export function updateImageTags(
  imageId: string,
  tags: string[]
): Promise<ActionResult<void>> {
  return apiPatch<void>(`/api/images/${encodeURIComponent(imageId)}`, { tags });
}

export function updateImageDownloadUrl(
  imageId: string,
  downloadUrl: string
): Promise<ActionResult<void>> {
  return apiPatch<void>(`/api/images/${encodeURIComponent(imageId)}`, {
    downloadUrl,
  });
}

/**
 * Fetches image data, preferring owner data; falls back to the public copy.
 */
export function fetchImageData(imageId: string): Promise<
  ActionResult<{
    data: Record<string, unknown>;
    isOwner: boolean;
  }>
> {
  return apiGet(`/api/images/${encodeURIComponent(imageId)}`);
}
