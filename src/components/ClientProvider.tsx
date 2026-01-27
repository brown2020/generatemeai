"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import CookieConsent from "react-cookie-consent";

import useAuthToken from "@/hooks/useAuthToken";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Get validated cookie name from environment.
 */
const getCookieName = (): string => {
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME;
  if (!cookieName) {
    throw new Error("NEXT_PUBLIC_COOKIE_NAME environment variable is not set");
  }
  return cookieName;
};

/**
 * Client-side provider that handles:
 * - Auth token management and store initialization
 * - WebView detection and viewport handling
 * - Cookie consent and toast notifications
 *
 * Note: Route protection is handled by proxy.ts at the edge.
 */
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthToken(getCookieName());
  const [isWebView, setIsWebView] = useState(false);

  useInitializeStores();

  // WebView detection + viewport handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for WebView environment
    const isRNWebView = !!window.ReactNativeWebView;
    setIsWebView(isRNWebView);

    // Height adjustment for mobile viewports
    const adjustHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Scroll handling for React Native WebView
    document.body.classList.toggle("noscroll", isRNWebView);

    // Set up event listeners
    window.addEventListener("resize", adjustHeight);
    window.addEventListener("orientationchange", adjustHeight);
    adjustHeight();

    // Cleanup
    return () => {
      window.removeEventListener("resize", adjustHeight);
      window.removeEventListener("orientationchange", adjustHeight);
      document.body.classList.remove("noscroll");
    };
  }, []);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center h-full bg-[#333b51]">
          <ClipLoader color="#fff" size={80} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {children}
        {!isWebView && (
          <CookieConsent>
            This app uses cookies to enhance the user experience.
          </CookieConsent>
        )}
        <Toaster position="bottom-center" />
      </div>
    </ErrorBoundary>
  );
}
