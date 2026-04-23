import { apiPost } from "@/lib/api/client";

/**
 * Syncs auth details to the users collection. Called after sign-in to keep
 * the user record up-to-date. Silent-on-failure to avoid breaking auth.
 */
export async function syncAuthToFirestoreServer(details: {
  email: string;
  displayName: string;
  photoUrl: string;
  emailVerified: boolean;
}): Promise<void> {
  try {
    await apiPost<void>("/api/auth/sync", details);
  } catch {
    // Fire-and-forget
  }
}
