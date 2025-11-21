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

