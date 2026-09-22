import { useEffect, useCallback, useRef } from "react";
import { getIdToken } from "firebase/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";
import { STORAGE_KEYS } from "@/constants/storage";
import { syncAuthToFirestoreServer } from "@/actions/syncAuth";

const REFRESH_INTERVAL = 50 * 60 * 1000;
const DEBOUNCE_DELAY = 1000;

/**
 * Auth cookie + store sync. Only mount when Firebase client config is present
 * (see ClientProvider AuthReadyProvider).
 */
const useAuthToken = (cookieName = "authToken") => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);

  const lastTokenRefreshKey = `${STORAGE_KEYS.LAST_TOKEN_REFRESH}${cookieName}`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const refreshAuthToken = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      if (!auth.currentUser) throw new Error("No user found");
      const idTokenResult = await getIdToken(auth.currentUser, true);
      if (!isMountedRef.current) return;
      setCookie(cookieName, idTokenResult, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      if (typeof window !== "undefined" && !window.ReactNativeWebView) {
        window.localStorage.setItem(lastTokenRefreshKey, Date.now().toString());
      }
    } catch {
      if (!isMountedRef.current) return;
      deleteCookie(cookieName, { path: "/" });
    }
  }, [cookieName, lastTokenRefreshKey]);

  const scheduleTokenRefresh = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      timeoutRef.current = setTimeout(refreshAuthToken, REFRESH_INTERVAL);
    }
  }, [refreshAuthToken]);

  useEffect(() => {
    if (typeof window === "undefined" || window.ReactNativeWebView) return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== lastTokenRefreshKey) return;
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(scheduleTokenRefresh, DEBOUNCE_DELAY);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [lastTokenRefreshKey, scheduleTokenRefresh]);

  useEffect(() => {
    if (loading) {
      setAuthDetails({ authReady: false, authPending: true });
      return;
    }
    if (user?.uid) {
      let isCurrentUser = true;
      setAuthDetails({ authReady: false, authPending: true });
      (async () => {
        try {
          const token = await getIdToken(user);
          if (!isMountedRef.current || !isCurrentUser) return;
          setCookie(cookieName, token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
          scheduleTokenRefresh();
          setAuthDetails({
            uid: user.uid,
            authEmail: user.email || "",
            authDisplayName: user.displayName || "",
            authPhotoUrl: user.photoURL || "",
            authEmailVerified: user.emailVerified || false,
            authReady: true,
            authPending: false,
          });
          syncAuthToFirestoreServer({
            email: user.email || "",
            displayName: user.displayName || "",
            photoUrl: user.photoURL || "",
            emailVerified: user.emailVerified || false,
          });
        } catch {
          if (!isMountedRef.current || !isCurrentUser) return;
          deleteCookie(cookieName, { path: "/" });
          setAuthDetails({
            uid: "",
            authEmail: "",
            authDisplayName: "",
            authPhotoUrl: "",
            authEmailVerified: false,
            authReady: true,
            authPending: false,
          });
        }
      })();
      return () => {
        isCurrentUser = false;
      };
    }
    setAuthDetails({
      uid: "",
      authEmail: "",
      authDisplayName: "",
      authPhotoUrl: "",
      authEmailVerified: false,
      authReady: true,
      authPending: false,
    });
    deleteCookie(cookieName, { path: "/" });
  }, [cookieName, loading, setAuthDetails, user, scheduleTokenRefresh]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { uid: user?.uid, loading, error };
};

export default useAuthToken;
