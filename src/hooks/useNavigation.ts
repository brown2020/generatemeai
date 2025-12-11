"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Shared navigation hook for Header and BottomBar components.
 * Provides consistent navigation behavior across the app.
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Checks if a navigation item is currently active based on path matching.
   * Compares first 5 characters of paths for section-level matching.
   */
  const isActive = useCallback(
    (path: string) => {
      return pathname.slice(0, 5) === path.slice(0, 5) && pathname !== "/";
    },
    [pathname]
  );

  /**
   * Navigates to a path with a small delay.
   *
   * Note: The 100ms delay is intentional for React Native WebView compatibility.
   * Without this delay, navigation can be interrupted by WebView's gesture handling,
   * causing inconsistent behavior on iOS. This ensures the tap event completes
   * before navigation begins.
   */
  const navigate = useCallback(
    (path: string) => {
      setTimeout(() => router.push(path), 100);
    },
    [router]
  );

  /**
   * Handles logo/home click with React Native WebView support.
   * Posts a "refresh" message to the WebView if running in that context.
   */
  const navigateHome = useCallback(() => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("refresh");
    }
    navigate("/");
  }, [navigate]);

  return {
    pathname,
    isActive,
    navigate,
    navigateHome,
  };
};
