/**
 * Centralized authentication hooks for consistent auth state access.
 */

import { useAuthStore } from "@/zustand/useAuthStore";

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
 * Hook to get full user profile information.
 */
export const useAuthUser = () => {
  const uid = useAuthStore((state) => state.uid);
  const email = useAuthStore((state) => state.authEmail);
  const displayName = useAuthStore((state) => state.authDisplayName);
  const photoUrl = useAuthStore((state) => state.authPhotoUrl);
  const emailVerified = useAuthStore((state) => state.authEmailVerified);

  return {
    uid: uid || null,
    email,
    displayName,
    photoUrl,
    emailVerified,
    isAuthenticated: !!uid,
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
