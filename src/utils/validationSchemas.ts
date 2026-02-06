/**
 * Zod validation schemas for server actions and forms.
 * Centralized schemas for consistent validation across the app.
 */

import { z } from "zod";
import { isValidModel } from "@/constants/modelRegistry";

/**
 * Image generation request schema.
 */
export const imageGenerationSchema = z.object({
  message: z
    .string()
    .min(1, "Prompt is required")
    .max(2000, "Prompt must be less than 2000 characters"),
  uid: z.string().min(1, "User ID is required"),
  model: z.string().refine(isValidModel, {
    message: "Invalid model selected",
  }),
  useCredits: z.boolean(),
  credits: z.number().min(0, "Credits cannot be negative"),
  aspectRatio: z.string().optional(),
  negativePrompt: z.string().max(1000, "Negative prompt too long").optional(),
  imageCount: z.number().int().min(1).max(4).optional(),
  imageField: z.instanceof(File).optional().nullable(),
  openai_api_key: z.string().optional(),
  replicate_api_key: z.string().optional(),
  fal_key: z.string().optional(),
  stability_api_key: z.string().optional(),
  ideogram_api_key: z.string().optional(),
});

export type ImageGenerationInput = z.infer<typeof imageGenerationSchema>;

/**
 * Tag suggestion request schema.
 */
export const tagSuggestionSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  colorScheme: z.string().optional(),
  lighting: z.string().optional(),
  imageStyle: z.string().optional(),
  selectedCategory: z.string().optional(),
  currentTags: z.array(z.string()).optional(),
  openAPIKey: z.string().optional(),
  useCredits: z.boolean(),
  credits: z.number().min(0, "Credits cannot be negative"),
});

export type TagSuggestionInput = z.infer<typeof tagSuggestionSchema>;

/**
 * Background removal request schema.
 */
export const backgroundRemovalSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  uid: z.string().min(1, "User ID is required"),
  useCredits: z.boolean(),
  credits: z.number().min(0, "Credits cannot be negative"),
  stability_api_key: z.string().optional(),
});

export type BackgroundRemovalInput = z.infer<typeof backgroundRemovalSchema>;

/**
 * Video generation request schema.
 */
export const videoGenerationSchema = z.object({
  videoModel: z.enum(["d-id", "runway-ml"], {
    message: "Invalid video model",
  }),
  imageUrl: z.string().url("Invalid image URL"),
  useCredits: z.boolean(),
  credits: z.number().min(0, "Credits cannot be negative"),
  scriptPrompt: z.string().nullable().optional(),
  audio: z.string().nullable().optional(),
  animationType: z.string().nullable().optional(),
  didAPIKey: z.string().optional(),
  runwayApiKey: z.string().optional(),
});

export type VideoGenerationInput = z.infer<typeof videoGenerationSchema>;

/**
 * Payment checkout schema.
 */
export const paymentCheckoutSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  credits: z.number().int().positive("Credits must be a positive integer"),
});

export type PaymentCheckoutInput = z.infer<typeof paymentCheckoutSchema>;

/**
 * Helper to parse FormData into a typed object.
 */
export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    // Handle boolean conversions
    if (value === "true" || value === "false") {
      data[key] = value === "true";
    }
    // Handle number conversions
    else if (key === "credits" || key === "amount" || key === "imageCount") {
      data[key] = Number(value);
    }
    // Handle file fields
    else if (value instanceof File) {
      data[key] = value;
    }
    // Handle strings
    else {
      data[key] = value;
    }
  });

  return schema.parse(data);
}
