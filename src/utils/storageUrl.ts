import { ValidationError } from "@/utils/errors";

/**
 * Allowlist for server-side fetching of user-supplied media URLs.
 *
 * Routes that accept a URL from the client (background removal, GIF conversion,
 * preview marking, gallery writes) may only touch that user's own objects in
 * Firebase Storage. Fetches do not follow redirects: each hop is checked again
 * so a Storage URL cannot bounce the server at an internal address.
 */
export const ALLOWED_STORAGE_HOSTS = [
  "storage.googleapis.com",
  "firebasestorage.googleapis.com",
] as const;

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

const USER_MEDIA_ROOTS = ["generated", "image-references", "video-generation"] as const;

function parsedHttpsUrl(urlString: string): URL | null {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  return url;
}

function isPrivateIpv4(host: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    host === "metadata"
  ) {
    return true;
  }
  if (isPrivateIpv4(host)) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return true;
  }
  return false;
}

/**
 * Returns true only for HTTPS URLs whose host is (or is a subdomain of) an
 * allowed Firebase Storage host. Any parse failure or other scheme/host
 * returns false.
 */
export function isAllowedStorageUrl(urlString: string): boolean {
  const url = parsedHttpsUrl(urlString);
  if (!url || isBlockedHostname(url.hostname)) return false;

  return ALLOWED_STORAGE_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
}

/** HTTPS URL whose host is not a local, link-local, or metadata address. */
export function isSafeRemoteUrl(urlString: string): boolean {
  const url = parsedHttpsUrl(urlString);
  if (!url) return false;
  return !isBlockedHostname(url.hostname);
}

/**
 * Object path inside the bucket (`generated/{uid}/file.jpg`), or null when
 * the URL is not an allowed Storage URL.
 */
export function storageObjectPath(urlString: string): string | null {
  const url = parsedHttpsUrl(urlString);
  if (!url || !isAllowedStorageUrl(urlString)) return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean).map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });

  let objectPath: string | null = null;
  if (host === "firebasestorage.googleapis.com" || host.endsWith(".firebasestorage.googleapis.com")) {
    const marker = parts.indexOf("o");
    if (marker === -1 || marker >= parts.length - 1) return null;
    objectPath = parts.slice(marker + 1).join("/");
  } else if (host === "storage.googleapis.com") {
    if (parts.length < 2) return null;
    objectPath = parts.slice(1).join("/");
  } else if (host.endsWith(".storage.googleapis.com")) {
    if (parts.length < 1) return null;
    objectPath = parts.join("/");
  }

  if (!objectPath || objectPath.includes("..") || objectPath.includes("\\")) return null;
  return objectPath;
}

/** True when the URL points at an object this server stored for `uid`. */
export function isUserMediaUrl(urlString: string, uid: string): boolean {
  if (!uid || uid.includes("/") || uid.includes("..") || uid.includes("\\")) return false;
  const objectPath = storageObjectPath(urlString);
  if (!objectPath) return false;
  return USER_MEDIA_ROOTS.some((root) => objectPath.startsWith(`${root}/${uid}/`));
}

interface CheckedResponse {
  ok: boolean;
  status?: number;
  headers?: { get(name: string): string | null };
  arrayBuffer?: () => Promise<ArrayBuffer>;
  blob?: () => Promise<Blob>;
}

/**
 * Fetches `urlString` without following redirects automatically. Every hop
 * must pass `allow`. The body is capped at `maxBytes`.
 */
export async function fetchChecked(
  urlString: string,
  options: {
    maxBytes: number;
    allow: (url: string) => boolean;
    fetchImpl?: (url: string, init?: RequestInit) => Promise<CheckedResponse>;
  }
): Promise<Buffer> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let current = urlString;

  for (let hop = 0; hop < 4; hop += 1) {
    if (!options.allow(current)) {
      throw new ValidationError("URL not allowed");
    }

    const response = (await fetchImpl(current, { redirect: "manual" })) as CheckedResponse;
    const status = response.status ?? (response.ok ? 200 : 0);
    if (status >= 300 && status < 400) {
      const location = response.headers?.get("location");
      if (!location) throw new ValidationError("Redirect missing location");
      current = new URL(location, current).href;
      continue;
    }

    if (!response.ok) {
      throw new ValidationError("Failed to fetch media");
    }

    const advertised = Number(response.headers?.get("content-length") ?? "");
    if (Number.isFinite(advertised) && advertised > options.maxBytes) {
      throw new ValidationError("Media is too large");
    }

    const bytes = response.arrayBuffer
      ? Buffer.from(await response.arrayBuffer())
      : Buffer.from(await (await response.blob!()).arrayBuffer());
    if (bytes.byteLength > options.maxBytes) {
      throw new ValidationError("Media is too large");
    }
    return bytes;
  }

  throw new ValidationError("Too many redirects");
}
