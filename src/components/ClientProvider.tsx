"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import CookieConsent from "react-cookie-consent";

import useAuthToken from "@/hooks/useAuthToken";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import ErrorBoundary from "./ErrorBoundary";
import { usePathname, useRouter } from "next/navigation";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { loading, uid } = useAuthToken(process.env.NEXT_PUBLIC_COOKIE_NAME!);
  const router = useRouter();
  const pathname = usePathname();
  useInitializeStores();

  useEffect(() => {
    function adjustHeight() {
      const vh = window.innerHeight * 0.01;
      console.log(`--vh value is now: ${vh}px`);
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    window.addEventListener("resize", adjustHeight);
    window.addEventListener("orientationchange", adjustHeight);

    // Initial adjustment
    adjustHeight();

    // Cleanup
    return () => {
      window.removeEventListener("resize", adjustHeight);
      window.removeEventListener("orientationchange", adjustHeight);
    };
  }, []);

  useEffect(() => {
    if (window.ReactNativeWebView) {
      document.body.classList.add("noscroll");
    } else {
      document.body.classList.remove("noscroll");
    }

    return () => {
      document.body.classList.remove("noscroll");
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !uid &&
      pathname != "/" &&
      !pathname.includes("images/") &&
      !pathname.includes("/about") &&
      !pathname.includes("/terms") &&
      !pathname.includes("/privacy") &&
      !pathname.includes("/support")
    ) {
      router.push("/");
    }
  }, [loading, pathname, router, uid]);

  if (loading)
    return (
      <ErrorBoundary>
        <div
          className={`flex flex-col items-center justify-center h-full bg-[#333b51]`}
        >
          <ClipLoader color="#fff" size={80} />
        </div>
      </ErrorBoundary>
    );

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {children}
        {!window.ReactNativeWebView && (
          <CookieConsent>
            This app uses cookies to enhance the user experience.
          </CookieConsent>
        )}
        <Toaster position="bottom-center" />
      </div>
    </ErrorBoundary>
  );
}
