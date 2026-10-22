"use client";

import { useCallback, type MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Shared navigation hook for Header and BottomBar links.
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
   * Click handler for nav links. Browsers follow the link normally. Inside the
   * React Native WebView, navigation waits 100ms so the WebView's gesture
   * handling doesn't interrupt it on iOS, and the home link asks the shell to refresh.
   */
  const onLinkClick = useCallback(
    (path: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (typeof window === "undefined" || !window.ReactNativeWebView) return;
      event.preventDefault();
      if (path === "/") window.ReactNativeWebView.postMessage("refresh");
      setTimeout(() => router.push(path), 100);
    },
    [router]
  );

  return { pathname, isActive, onLinkClick };
};
