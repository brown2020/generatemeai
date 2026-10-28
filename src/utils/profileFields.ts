/**
 * Profile fields the signed-in user may change. Everything else, including
 * credits and emailVerified, is dropped before the profile document is merged.
 */

import { z } from "zod";

const bounded = (max: number) => z.string().max(max);

export const profileUpdateSchema = z.object({
  email: bounded(320).optional(),
  contactEmail: bounded(320).optional(),
  displayName: bounded(120).optional(),
  photoUrl: bounded(2000).optional(),
  useCredits: z.boolean().optional(),
  openai_api_key: bounded(500).optional(),
  stability_api_key: bounded(500).optional(),
  bria_api_key: bounded(500).optional(),
  did_api_key: bounded(500).optional(),
  replicate_api_key: bounded(500).optional(),
  ideogram_api_key: bounded(500).optional(),
  runway_ml_api_key: bounded(500).optional(),
  selectedAvatar: bounded(200).optional(),
  selectedTalkingPhoto: bounded(200).optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

const PROFILE_FIELDS = Object.keys(profileUpdateSchema.shape);

/**
 * Keeps only allowlisted profile fields. Invalid values for those fields
 * throw (ZodError). Unknown fields, including credits, are ignored.
 */
export function sanitizeProfileUpdate(updates: Record<string, unknown>): ProfileUpdate {
  const known: Record<string, unknown> = {};
  for (const field of PROFILE_FIELDS) {
    if (field in updates) known[field] = updates[field];
  }
  return profileUpdateSchema.parse(known);
}

/** @see sanitizeProfileUpdate */
export const stripServerControlledProfileFields = sanitizeProfileUpdate;
