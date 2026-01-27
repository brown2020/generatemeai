/**
 * Runtime environment variable validation.
 * Validates required environment variables at startup to fail fast.
 */

import { z } from "zod";

/**
 * Server-side environment variables schema.
 */
const serverEnvSchema = z.object({
  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z
    .string()
    .email("FIREBASE_CLIENT_EMAIL must be a valid email"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),

  // API Keys (optional - users can provide their own)
  OPENAI_API_KEY: z.string().optional(),
  REPLICATE_API_KEY: z.string().optional(),
  FAL_KEY: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),
  IDEOGRAM_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

/**
 * Client-side environment variables schema.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_COOKIE_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_COOKIE_NAME is required"),
  NEXT_PUBLIC_ENABLE_PREVIEW_MARKING: z
    .enum(["true", "false"])
    .default("false"),

  // Firebase Client
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Stripe Public
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates server environment variables.
 * Should be called at server startup.
 */
export function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

/**
 * Validates client environment variables.
 * Should be called at client startup.
 */
export function validateClientEnv(): ClientEnv {
  const env = {
    NEXT_PUBLIC_COOKIE_NAME: process.env.NEXT_PUBLIC_COOKIE_NAME,
    NEXT_PUBLIC_ENABLE_PREVIEW_MARKING:
      process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  };

  const parsed = clientEnvSchema.safeParse(env);

  if (!parsed.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

/**
 * Type-safe access to validated environment variables.
 * Only use after validation.
 */
export const getEnv = () => {
  if (typeof window === "undefined") {
    return validateServerEnv();
  }
  return validateClientEnv();
};
