import { apiDelete, apiGet, apiPatch } from "@/lib/api/client";
import type { ActionResult } from "@/utils/errors";

/**
 * Fetches (or returns defaults for) the authenticated user's profile.
 */
export function fetchProfileServer(): Promise<
  ActionResult<Record<string, unknown>>
> {
  return apiGet<Record<string, unknown>>("/api/profile");
}

/**
 * Merges provided fields into the user's profile document.
 */
export function updateProfileServer(
  updates: Record<string, unknown>
): Promise<ActionResult<void>> {
  return apiPatch<void>("/api/profile", updates);
}

/**
 * Deletes the user's profile, covers, public images, payments, and auth user.
 */
export function deleteAccountServer(): Promise<ActionResult<void>> {
  return apiDelete<void>("/api/profile");
}

/**
 * Lists the authenticated user's payment history, newest first.
 */
export function fetchPaymentsServer(): Promise<
  ActionResult<Record<string, unknown>[]>
> {
  return apiGet<Record<string, unknown>[]>("/api/profile/payments");
}
