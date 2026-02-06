/**
 * Runtime validation utilities for Firestore document data.
 * Ensures type safety when reading documents from Firestore.
 */

import { z } from "zod";
import { Timestamp } from "firebase/firestore";

/**
 * Custom Zod type for Firestore Timestamp.
 */
const timestampSchema = z.custom<Timestamp>(
  (val) => val instanceof Timestamp,
  { message: "Expected Firestore Timestamp" }
);

/**
 * Schema for ImageData from Firestore.
 */
export const imageDataSchema = z.object({
  id: z.string(),
  downloadUrl: z.string(),
  videoDownloadUrl: z.string().optional(),

  // Display/sharing
  caption: z.string().optional(),
  backgroundColor: z.string().optional(),
  isSharable: z.boolean().optional(),
  password: z.string().optional(),

  // Generation params (all optional since extending Partial<GenerationParams>)
  freestyle: z.string().optional(),
  style: z.string().optional(),
  lighting: z.string().optional(),
  colorScheme: z.string().optional(),
  model: z.string().optional(),
  imageReference: z.string().optional(),
  imageCategory: z.string().optional(),
  perspective: z.string().optional(),
  composition: z.string().optional(),
  medium: z.string().optional(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  prompt: z.string().optional(),

  // Video-specific
  videoModel: z.string().optional(),
  audio: z.string().optional(),
  scriptPrompt: z.string().optional(),
  animation: z.string().optional(),

  // Metadata
  timestamp: timestampSchema.optional(),
});

export type ValidatedImageData = z.infer<typeof imageDataSchema>;

/**
 * Schema for ImageListItem from Firestore.
 */
export const imageListItemSchema = z.object({
  id: z.string(),
  downloadUrl: z.string().optional(),
  caption: z.string().optional(),
  freestyle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  backgroundColor: z.string().optional(),
  videoDownloadUrl: z.string().optional(),
  timestamp: timestampSchema.optional(),
});

export type ValidatedImageListItem = z.infer<typeof imageListItemSchema>;

/**
 * Validates Firestore document data as ImageData.
 * Returns the validated data or null if validation fails.
 */
export function validateImageData(data: unknown): ValidatedImageData | null {
  const result = imageDataSchema.safeParse(data);
  if (!result.success) {
    console.error("Invalid ImageData from Firestore:", result.error.format());
    return null;
  }
  return result.data;
}

/**
 * Validates Firestore document data as ImageListItem.
 * Returns the validated data or null if validation fails.
 */
export function validateImageListItem(
  data: unknown
): ValidatedImageListItem | null {
  const result = imageListItemSchema.safeParse(data);
  if (!result.success) {
    console.error(
      "Invalid ImageListItem from Firestore:",
      result.error.format()
    );
    return null;
  }
  return result.data;
}

/**
 * Validates an array of Firestore documents as ImageListItems.
 * Filters out invalid items and logs warnings.
 */
export function validateImageListItems(
  items: unknown[]
): ValidatedImageListItem[] {
  return items
    .map((item) => {
      return validateImageListItem(item);
    })
    .filter((item): item is ValidatedImageListItem => item !== null);
}
