/**
 * Centralized authentication hooks for consistent auth state access.
 * Selectors are defined in zustand/selectors.ts - this re-exports them
 * along with non-hook utilities.
 */

import { useAuthStore } from "@/zustand/useAuthStore";

// Re-export selectors from central location
export { useAuthState, useAuthUser, useAuthStatus } from "@/zustand/selectors";

/**
 * Hook to get current authenticated user ID.
 * Returns null if not authenticated.
 */
export const useAuthUid = () => {
  return useAuthStore((state) => state.uid) || null;
};

/**
 * Hook that provides auth state with authentication check.
 * Use this when you need to know if a user is authenticated.
 */
export const useRequireAuth = () => {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);
  const authPending = useAuthStore((state) => state.authPending);

  return {
    uid: uid || null,
    isAuthenticated: !!uid,
    isReady: authReady,
    isPending: authPending,
  };
};

/**
 * Non-hook helper to get UID from store state.
 * Use this in non-component contexts (like store actions).
 */
export const getAuthenticatedUid = (): string | null => {
  const uid = useAuthStore.getState().uid;
  return uid || null;
};

/**
 * Non-hook helper to check if user is authenticated.
 * Use this in non-component contexts.
 */
export const isAuthenticated = (): boolean => {
  return !!useAuthStore.getState().uid;
};
