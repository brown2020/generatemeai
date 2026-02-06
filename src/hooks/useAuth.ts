/**
 * Centralized authentication hooks for consistent auth state access.
 * Single source of truth for all auth-related selectors and utilities.
 */

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";

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

/**
 * Lightweight hook for sign out functionality only.
 * Use this instead of useAuthLogic when you only need sign out.
 */
export const useSignOut = () => {
  const clearAuthDetails = useAuthStore((s) => s.clearAuthDetails);

  return useCallback(async () => {
    try {
      await signOut(auth);
      clearAuthDetails();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out.");
    }
  }, [clearAuthDetails]);
};

// ============================================================================
// Non-hook Utilities (for use outside React components)
// Re-exported from zustand/helpers.ts for single source of truth
// ============================================================================

export {
  isAuthenticated,
  getAuthUidOrNull,
  getAuthState,
  requireAuthUid,
} from "@/zustand/helpers";
