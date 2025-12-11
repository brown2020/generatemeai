/**
 * Part of a prompt with value and suffix.
 */
interface PromptPart {
  value: string | undefined;
  suffix: string;
}

/**
 * Generates a complete prompt from base prompt and additional parameters.
 * Filters out "None" values and empty strings.
 *
 * @param basePrompt - The core description
 * @param parts - Array of prompt parts with values and suffixes
 * @param tags - Optional array of tags to append
 * @returns Formatted prompt string
 *
 * @example
 * generatePromptFromParts(
 *   "a beautiful landscape",
 *   [
 *     { value: "Impressionism", suffix: "style" },
 *     { value: "Golden Hour", suffix: "lighting" },
 *   ],
 *   ["nature", "peaceful"]
 * );
 * // Returns: "a beautiful landscape, Impressionism style, Golden Hour lighting, nature, peaceful"
 */
export const generatePromptFromParts = (
  basePrompt: string,
  parts: PromptPart[],
  tags: string[] = []
): string => {
  const additions = parts
    .filter((p) => p.value && p.value !== "None" && p.value.trim() !== "")
    .map((p) => `${p.value} ${p.suffix}`);

  const allParts = [basePrompt, ...additions];

  if (tags.length > 0) {
    allParts.push(tags.join(", "));
  }

  return allParts.join(", ");
};

/**
 * Legacy function signature for backward compatibility.
 * Consider migrating to generatePromptFromParts for better maintainability.
 */
export const generatePrompt = (
  basePrompt: string,
  style: string,
  color: string,
  lighting: string,
  category: string,
  perspective: string,
  composition: string,
  medium: string,
  mood: string,
  tags: string[]
): string => {
  return generatePromptFromParts(
    basePrompt,
    [
      { value: style, suffix: "style" },
      { value: color, suffix: "color scheme" },
      { value: lighting, suffix: "lighting" },
      { value: perspective, suffix: "perspective" },
      { value: composition, suffix: "composition" },
      { value: medium, suffix: "medium" },
      { value: mood, suffix: "mood" },
      { value: category, suffix: "" },
    ],
    tags
  );
};

/**
 * Extracts keywords from a prompt for tagging purposes.
 */
export const extractKeywords = (prompt: string): string[] => {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",
  ]);

  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
};

/**
 * Truncates a prompt to a maximum length while preserving word boundaries.
 */
export const truncatePrompt = (prompt: string, maxLength: number): string => {
  if (prompt.length <= maxLength) return prompt;

  const truncated = prompt.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + "..."
    : truncated + "...";
};
