import { useAuthStore } from "./useAuthStore";

/**
 * Gets authenticated UID or throws an error.
 * Use in store actions that require authentication.
 */
export const requireAuthUid = (context: string): string => {
  const uid = useAuthStore.getState().uid;
  if (!uid) {
    throw new Error(`Authentication required for: ${context}`);
  }
  return uid;
};

/**
 * Gets authenticated UID or returns null (for operations that can fail silently).
 */
export const getAuthUidOrNull = (): string | null => {
  return useAuthStore.getState().uid || null;
};

/**
 * Gets full auth state from store.
 * Use in non-hook contexts.
 */
export const getAuthState = () => {
  const state = useAuthStore.getState();
  return {
    uid: state.uid,
    authEmail: state.authEmail,
    authDisplayName: state.authDisplayName,
    authPhotoUrl: state.authPhotoUrl,
    authEmailVerified: state.authEmailVerified,
  };
};

/**
 * Checks if a user is currently authenticated.
 * Use in non-hook contexts.
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthUidOrNull();
};
