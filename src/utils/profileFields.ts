/**
 * Profile fields that must only ever be mutated by trusted server logic
 * (credit purchases in /api/payments/process and deductions in
 * creditValidator). Clients can send arbitrary fields to PATCH /api/profile,
 * so these are stripped before any write to prevent forging a credit balance.
 */
export const SERVER_CONTROLLED_PROFILE_FIELDS = ["credits"] as const;

/**
 * Returns a shallow copy of `updates` with all server-controlled fields
 * removed. Used to sanitize client-supplied profile updates.
 */
export function stripServerControlledProfileFields(
  updates: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...updates };
  for (const field of SERVER_CONTROLLED_PROFILE_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}
