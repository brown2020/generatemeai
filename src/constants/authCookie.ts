/** Shared auth-cookie name. Client, proxy, and API routes must use the same fallback. */
export const AUTH_COOKIE_FALLBACK = "generateAuthToken";

export function authCookieName(): string {
  return process.env.NEXT_PUBLIC_COOKIE_NAME?.trim() || AUTH_COOKIE_FALLBACK;
}
