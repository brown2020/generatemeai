"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import CookieConsent from "react-cookie-consent";

import useAuthToken from "@/hooks/useAuthToken";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import ErrorBoundary from "./ErrorBoundary";
import { usePathname, useRouter } from "next/navigation";
import { isPublicRoute } from "@/constants/routes";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { loading, uid } = useAuthToken(process.env.NEXT_PUBLIC_COOKIE_NAME!);
  const router = useRouter();
  const pathname = usePathname();
  const [isWebView, setIsWebView] = useState(false);

  useInitializeStores();

  // Consolidated window-related effects (WebView detection + viewport handling)
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

  // Auth redirect effect
  useEffect(() => {
    if (!loading && !uid && !isPublicRoute(pathname)) {
      router.push("/");
    }
  }, [loading, pathname, router, uid]);

  if (loading)
    return (
      <ErrorBoundary>
        <div className="flex flex-col items-center justify-center h-full bg-[#333b51]">
          <ClipLoader color="#fff" size={80} />
        </div>
      </ErrorBoundary>
    );

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
