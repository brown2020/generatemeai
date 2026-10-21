import type { GenerationState } from "@/zustand/useGenerationStore";

type PromptSettings = Pick<
  GenerationState,
  | "imagePrompt"
  | "imageStyle"
  | "colorScheme"
  | "lighting"
  | "perspective"
  | "composition"
  | "medium"
  | "mood"
  | "selectedCategory"
  | "tags"
>;

/**
 * Builds the provider prompt from the user's description and chosen options.
 * Options hold display labels ("Golden Hour"); unset options ("None" or empty)
 * add nothing, so a prompt with default settings is exactly the description.
 *
 * @example
 * generatePrompt({ ...defaults, imagePrompt: "a fox", lighting: "Golden Hour" });
 * // "a fox, Golden Hour lighting"
 */
export const generatePrompt = (settings: PromptSettings): string => {
  const parts: Array<[string, string]> = [
    [settings.imageStyle, "style"],
    [settings.colorScheme, "color scheme"],
    [settings.lighting, "lighting"],
    [settings.perspective, "perspective"],
    [settings.composition, "composition"],
    [settings.medium, "medium"],
    [settings.mood, "mood"],
    [settings.selectedCategory, ""],
  ];

  const additions = parts
    .map(([value, suffix]) => [value.trim(), suffix] as const)
    .filter(([value]) => value !== "" && value.toLowerCase() !== "none")
    .map(([value, suffix]) => `${value} ${suffix}`.trim());

  return [settings.imagePrompt.trim(), ...additions, ...settings.tags].join(", ");
};
