/**
 * Centralized authentication hooks for consistent auth state access.
 * Single source of truth for all auth-related selectors and utilities.
 */

import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/zustand/useAuthStore";

// ============================================================================
// Auth Selectors (using useShallow for performance)
// ============================================================================

/**
 * Full auth state including user info and status flags.
 */
export const useAuthState = () =>
  useAuthStore(
    useShallow((s) => ({
      uid: s.uid,
      authEmail: s.authEmail,
      authDisplayName: s.authDisplayName,
      authPhotoUrl: s.authPhotoUrl,
      authReady: s.authReady,
      authPending: s.authPending,
    }))
  );

/**
 * Basic user info for display purposes.
 */
export const useAuthUser = () =>
  useAuthStore(
    useShallow((s) => ({
      uid: s.uid,
      authDisplayName: s.authDisplayName,
      authPhotoUrl: s.authPhotoUrl,
    }))
  );

/**
 * Auth status flags for conditional rendering.
 */
export const useAuthStatus = () =>
  useAuthStore(
    useShallow((s) => ({
      isAuthenticated: !!s.uid,
      isReady: s.authReady,
      isPending: s.authPending,
    }))
  );

// ============================================================================
// Convenience Hooks
// ============================================================================

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

// ============================================================================
// Non-hook Utilities (for use outside React components)
// ============================================================================

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
