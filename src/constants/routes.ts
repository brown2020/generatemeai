/**
 * Route configuration constants.
 */

/**
 * Routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/terms",
  "/privacy",
  "/support",
] as const;

/**
 * Route prefixes that don't require authentication.
 */
export const PUBLIC_ROUTE_PREFIXES = ["/images/"] as const;

/**
 * Checks if a pathname is a public route.
 */
export const isPublicRoute = (pathname: string): boolean => {
  if ((PUBLIC_ROUTES as readonly string[]).includes(pathname)) return true;
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.includes(prefix));
};
