/**
 * Server-side authentication utility for Server Actions and Route Handlers.
 * Verifies the Firebase ID token from the auth cookie and returns the authenticated UID.
 */

import { cookies } from "next/headers";
import { authCookieName } from "@/constants/authCookie";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { AuthenticationError } from "./errors";

export interface AuthContext {
  uid: string;
  emailVerified: boolean;
}

/**
 * Verifies the auth cookie and returns the uid plus the token's
 * email_verified claim. Throws AuthenticationError if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName())?.value;

  if (!token) {
    throw new AuthenticationError("Authentication required. Please sign in.");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      emailVerified: decoded.email_verified === true,
    };
  } catch {
    throw new AuthenticationError(
      "Your session has expired. Please sign in again."
    );
  }
}

/**
 * Verifies the auth cookie and returns the authenticated user's UID.
 * Throws AuthenticationError if not authenticated.
 */
export async function authenticateAction(): Promise<string> {
  return (await getAuthContext()).uid;
}
