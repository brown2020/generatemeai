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
   * The delay ensures smooth transitions in React Native WebView contexts.
   */
  const navigate = useCallback(
    (path: string) => {
      setTimeout(() => router.push(path), 100);
    },
    [router]
  );

  /**
   * Handles logo/home click with React Native WebView support.
   */
  const navigateHome = useCallback(() => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("refresh");
    }
    navigate("/");
  }, [navigate]);

  /**
   * Gets the active class names for a navigation item.
   */
  const getNavItemClassName = useCallback(
    (path: string, baseClasses: string) => {
      const activeClasses = isActive(path)
        ? "opacity-100 bg-white/30"
        : "opacity-50";
      return `${baseClasses} ${activeClasses}`;
    },
    [isActive]
  );

  return {
    pathname,
    isActive,
    navigate,
    navigateHome,
    getNavItemClassName,
  };
};
