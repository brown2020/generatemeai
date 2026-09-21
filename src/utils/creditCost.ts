import { creditsToMinus, getMaxImages } from "@/constants/modelRegistry";

/** Written once when the server creates a profile. The client does not invent this balance. */
export const STARTING_CREDITS = 1000;

/**
 * Caps a requested image count at the model's published maximum.
 */
export function boundedImageCount(
  modelName: string,
  imageCount: number | undefined
): number {
  const requested = Number.isFinite(imageCount) ? Math.floor(imageCount as number) : 1;
  const max = getMaxImages(modelName);
  return Math.min(Math.max(requested, 1), max);
}

/**
 * Credits required for one generation: per-image price times the bounded count.
 * The generate button and the image route both call this function.
 */
export function generationCreditCost(
  modelName: string,
  imageCount: number | undefined
): number {
  return creditsToMinus(modelName) * boundedImageCount(modelName, imageCount);
}
