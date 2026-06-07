/**
 * Allowlist for server-side fetching of user-supplied media URLs.
 *
 * Several API routes fetch a URL that the client passes in (background
 * removal, GIF conversion, preview marking). Those URLs are always the
 * user's own Firebase Storage signed URLs, so we restrict server-side
 * fetches to known Storage hosts over HTTPS. This prevents SSRF (probing
 * internal services / cloud metadata) and, for ffmpeg inputs, `file://`
 * local-file reads.
 */
export const ALLOWED_STORAGE_HOSTS = [
  "storage.googleapis.com",
  "firebasestorage.googleapis.com",
] as const;

/**
 * Returns true only for HTTPS URLs whose host is (or is a subdomain of) an
 * allowed Firebase Storage host. Any parse failure or other scheme/host
 * returns false.
 */
export function isAllowedStorageUrl(urlString: string): boolean {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  return ALLOWED_STORAGE_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
}
