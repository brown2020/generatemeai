/**
 * Route configuration constants.
 * Single source of truth for route access control.
 */

/**
 * Routes that require authentication.
 * Used by proxy.ts for edge-level route protection.
 */
export const PROTECTED_ROUTES = [
  "/generate",
  "/profile",
  "/images",
  "/payment-attempt",
  "/payment-success",
] as const;

/**
 * Routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/terms",
  "/privacy",
  "/support",
  "/login",
  "/signup",
  "/forgot-password",
  "/loginfinish",
] as const;

/**
 * Route prefixes that don't require authentication.
 */
export const PUBLIC_ROUTE_PREFIXES = ["/images/"] as const;

/**
 * Checks if a pathname requires authentication.
 * Note: /images is protected but /images/[id] is public (for sharing)
 */
export const isProtectedRoute = (pathname: string): boolean => {
  // Special case: /images/[id] is public for sharing
  if (pathname.startsWith("/images/") && pathname !== "/images/") {
    return false;
  }

  return (PROTECTED_ROUTES as readonly string[]).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

/**
 * The page to return to after sign-in, taken from the `redirect` query that
 * proxy.ts adds when it sends a visitor to /login. Only protected same-site paths qualify, so the value can
 * never send a user to another origin.
 */
export const signInRedirectPath = (value: string | null): string | null => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return isProtectedRoute(value) ? value : null;
};

/**
 * Checks if a pathname is a public route.
 */
export const isPublicRoute = (pathname: string): boolean => {
  if ((PUBLIC_ROUTES as readonly string[]).includes(pathname)) return true;
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};
