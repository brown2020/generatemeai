/**
 * Server-side authentication utility for Server Actions and Route Handlers.
 * Verifies the Firebase ID token from the auth cookie and returns the authenticated UID.
 */

import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { AuthenticationError } from "./errors";

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || "authToken";

/**
 * Verifies the auth cookie and returns the authenticated user's UID.
 * Throws AuthenticationError if not authenticated.
 */
export async function authenticateAction(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new AuthenticationError("Authentication required. Please sign in.");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new AuthenticationError(
      "Your session has expired. Please sign in again."
    );
  }
}
