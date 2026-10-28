import path from "path";

/**
 * Directory for a preview sample. Returns null when the type or value would
 * escape `public/previews` (including the `previews-evil` prefix trick).
 */
export function previewDirectory(type: string, value: string): string | null {
  const sanitizedType = type.replace(/[^a-zA-Z]/g, "");
  if (!sanitizedType) return null;
  if (/[./\\]|\0|\.\./.test(value)) return null;

  const normalizedValue = value.replace(/\s+/g, "");
  if (!normalizedValue) return null;

  const base = path.resolve(process.cwd(), "public", "previews");
  const dir = path.resolve(base, sanitizedType, normalizedValue);
  const relative = path.relative(base, dir);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return dir;
}

export function previewAdminUids(): string[] {
  return (process.env.PREVIEW_ADMIN_UIDS ?? "")
    .split(",")
    .map((uid) => uid.trim())
    .filter(Boolean);
}
