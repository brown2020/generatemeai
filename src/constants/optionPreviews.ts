/**
 * Example images shipped for generation options, keyed by their folder under
 * public/previews (`<type>s/<value>`), with the number of `<n>.jpg` files.
 */
export const OPTION_PREVIEW_COUNTS: Record<string, number> = {
  "colors/Nature": 1,
};

export const optionPreviewImages = (type: string, value: string): string[] => {
  const folder = `${type}s/${value}`;
  return Array.from(
    { length: OPTION_PREVIEW_COUNTS[folder] ?? 0 },
    (_, index) => `/previews/${folder}/${index + 1}.jpg`
  );
};
