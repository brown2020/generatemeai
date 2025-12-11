export const checkImageExists = async (src: string): Promise<boolean> => {
  try {
    const res = await fetch(src, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

export const normalizeValue = (value: string): string => {
  return value.replace(/\s+/g, "");
};

/**
 * Extracts the file extension from a URL.
 * Handles URLs with query parameters.
 *
 * @param url - The URL to extract the file type from
 * @returns The file extension (e.g., "gif", "mp4") or null if not found
 */
export const getFileTypeFromUrl = (url: string): string | null => {
  if (!url) return null;

  const fileName = url.split("/").pop();
  if (!fileName) return null;

  const cleanFileName = fileName.split("?")[0];
  const fileParts = cleanFileName.split(".");

  return fileParts.length > 1 ? fileParts.pop() || null : null;
};

/**
 * Checks if a URL points to a GIF file.
 */
export const isGifUrl = (url: string): boolean => {
  return getFileTypeFromUrl(url) === "gif";
};

/**
 * Checks if image data has video content (excluding GIFs).
 */
export const hasVideoContent = (videoDownloadUrl?: string): boolean => {
  if (!videoDownloadUrl) return false;
  return !isGifUrl(videoDownloadUrl);
};
