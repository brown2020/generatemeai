import { useEffect, useCallback, useRef } from "react";
import { getIdToken } from "firebase/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";
import { STORAGE_KEYS } from "@/constants/storage";

const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const DEBOUNCE_DELAY = 1000;

const useAuthToken = (cookieName = "authToken") => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  const lastTokenRefreshKey = `${STORAGE_KEYS.LAST_TOKEN_REFRESH}${cookieName}`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const refreshAuthToken = useCallback(async () => {
    // Don't refresh if component is unmounted
    if (!isMountedRef.current) return;

    try {
      if (!auth.currentUser) throw new Error("No user found");
      const idTokenResult = await getIdToken(auth.currentUser, true);

      // Check mount status again after async operation
      if (!isMountedRef.current) return;

      setCookie(cookieName, idTokenResult, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (typeof window !== "undefined" && !window.ReactNativeWebView) {
        window.localStorage.setItem(lastTokenRefreshKey, Date.now().toString());
      }
    } catch {
      // Only handle error if still mounted
      if (!isMountedRef.current) return;
      deleteCookie(cookieName);
    }
  }, [cookieName, lastTokenRefreshKey]);

  const scheduleTokenRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    ) {
      timeoutRef.current = setTimeout(refreshAuthToken, REFRESH_INTERVAL);
    }
  }, [refreshAuthToken]);

  // Handle storage changes with debouncing
  useEffect(() => {
    if (typeof window === "undefined" || window.ReactNativeWebView) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== lastTokenRefreshKey) return;

      // Debounce the refresh scheduling
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(
        scheduleTokenRefresh,
        DEBOUNCE_DELAY
      );
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [lastTokenRefreshKey, scheduleTokenRefresh]);

  // Sync user state with auth store and set cookie immediately
  useEffect(() => {
    if (user?.uid) {
      setAuthDetails({
        uid: user.uid,
        authEmail: user.email || "",
        authDisplayName: user.displayName || "",
        authPhotoUrl: user.photoURL || "",
        authEmailVerified: user.emailVerified || false,
        authReady: true,
        authPending: false,
      });

      // Set auth cookie immediately for proxy.ts route protection
      // Use async IIFE with proper error handling and mount check
      (async () => {
        try {
          const token = await getIdToken(user);
          // Check if still mounted before updating state
          if (!isMountedRef.current) return;

          setCookie(cookieName, token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          scheduleTokenRefresh();
        } catch {
          // Token fetch failed — cookie will be absent so proxy.ts will redirect if needed
        }
      })();
    } else {
      // Important: auth can be "resolved" even when signed out.
      // We keep `authReady=true` so pages can safely decide between owner vs public reads
      // without a transient "unauthenticated" phase causing permission-denied errors.
      setAuthDetails({
        uid: "",
        authEmail: "",
        authDisplayName: "",
        authPhotoUrl: "",
        authEmailVerified: false,
        authReady: true,
        authPending: false,
      });
      deleteCookie(cookieName);
    }
  }, [
    cookieName,
    setAuthDetails,
    user,
    scheduleTokenRefresh,
  ]);

  // Cleanup on unmount - mark as unmounted to prevent stale updates
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { uid: user?.uid, loading, error };
};

export default useAuthToken;
