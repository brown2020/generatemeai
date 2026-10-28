import { apiDelete, apiPost } from "@/lib/api/client";

const sessionHeaders = { "x-auth-session": "1" };

/** Asks the server to store the Firebase ID token in an HttpOnly cookie. */
export async function establishAuthSession(idToken: string): Promise<boolean> {
  const result = await apiPost<{ ok: boolean }>(
    "/api/auth/session",
    { idToken },
    { headers: sessionHeaders }
  );
  return result.success;
}

/** Clears the HttpOnly auth cookie. The browser cannot delete it itself. */
export async function clearAuthSession(): Promise<void> {
  await apiDelete("/api/auth/session", { headers: sessionHeaders });
}
