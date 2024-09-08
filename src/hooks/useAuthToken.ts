import { useEffect, useState } from "react";
import { getIdToken } from "firebase/auth";
import { deleteCookie, setCookie } from "cookies-next";
import { debounce } from "lodash";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuthStore } from "@/zustand/useAuthStore";
import { auth } from "@/firebase/firebaseClient";

const useAuthToken = (cookieName = "authToken") => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthDetails = useAuthStore((state) => state.setAuthDetails);
  const clearAuthDetails = useAuthStore((state) => state.clearAuthDetails);

  const refreshInterval = 50 * 60 * 1000; // 50 minutes
  const lastTokenRefresh = `lastTokenRefresh_${cookieName}`;

  const [activityTimeout, setActivityTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const refreshAuthToken = async () => {
    try {
      if (!auth.currentUser) throw new Error("No user found");
      const idTokenResult = await getIdToken(auth.currentUser, true);

      setCookie(cookieName, idTokenResult, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      if (!window.ReactNativeWebView) {
        window.localStorage.setItem(lastTokenRefresh, Date.now().toString());
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Error refreshing token");
      }
      deleteCookie(cookieName);
    }
  };

  const scheduleTokenRefresh = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
    if (document.visibilityState === "visible") {
      const timeoutId = setTimeout(refreshAuthToken, refreshInterval);
      setActivityTimeout(timeoutId);
    }
  };

  const handleStorageChange = debounce((e: StorageEvent) => {
    if (e.key === lastTokenRefresh) {
      scheduleTokenRefresh();
    }
  }, 1000);

  useEffect(() => {
    if (!window.ReactNativeWebView) {
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      handleStorageChange.cancel();
    };
  }, [activityTimeout, handleStorageChange]);

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
