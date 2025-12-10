import { useEffect, useCallback, useRef } from "react";
import { getIdToken } from "firebase/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";

const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const DEBOUNCE_DELAY = 1000;

const useAuthToken = (cookieName = "authToken") => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  const lastTokenRefreshKey = `lastTokenRefresh_${cookieName}`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshAuthToken = useCallback(async () => {
    try {
      if (!auth.currentUser) throw new Error("No user found");
      const idTokenResult = await getIdToken(auth.currentUser, true);

      setCookie(cookieName, idTokenResult, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (typeof window !== "undefined" && !window.ReactNativeWebView) {
        window.localStorage.setItem(lastTokenRefreshKey, Date.now().toString());
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Error refreshing token");
      }
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

  // Sync user state with auth store
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
    } else {
      clearAuthDetails();
      deleteCookie(cookieName);
    }
  }, [clearAuthDetails, cookieName, setAuthDetails, user]);

  return { uid: user?.uid, loading, error };
};

export default useAuthToken;
