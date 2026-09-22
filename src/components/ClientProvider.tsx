"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import CookieConsent from "react-cookie-consent";

import useAuthToken from "@/hooks/useAuthToken";
import { useInitializeStores } from "@/zustand/useInitializeStores";
import { hasClientConfig } from "@/firebase/firebaseClient";
import ErrorBoundary from "./ErrorBoundary";

const getCookieName = (): string => {
  return process.env.NEXT_PUBLIC_COOKIE_NAME?.trim() || "generateAuthToken";
};

function subscribeToWebView() {
  return () => {};
}

function readWebView() {
  return !!window.ReactNativeWebView;
}

function ClientShell({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const isWebView = useSyncExternalStore(
    subscribeToWebView,
    readWebView,
    () => false
  );

  useInitializeStores();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adjustHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    const isRNWebView = !!window.ReactNativeWebView;
    document.body.classList.toggle("noscroll", isRNWebView);
    window.addEventListener("resize", adjustHeight);
    window.addEventListener("orientationchange", adjustHeight);
    adjustHeight();
    return () => {
      window.removeEventListener("resize", adjustHeight);
      window.removeEventListener("orientationchange", adjustHeight);
      document.body.classList.remove("noscroll");
    };
  }, []);

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="flex h-full flex-col items-center justify-center bg-[#333b51]">
          <ClipLoader color="#fff" size={80} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col">
        {children}
        {!isWebView && (
          <aside aria-label="Cookie consent">
            <CookieConsent>
              This app uses cookies to enhance the user experience.
            </CookieConsent>
          </aside>
        )}
        <Toaster position="bottom-center" />
      </div>
    </ErrorBoundary>
  );
}

function AuthReadyProvider({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthToken(getCookieName());
  return <ClientShell loading={loading}>{children}</ClientShell>;
}

function AuthSkippedProvider({ children }: { children: React.ReactNode }) {
  // Soft-skip path: no Firebase Auth listener during CI without secrets.
  return <ClientShell loading={false}>{children}</ClientShell>;
}

/**
 * Client-side provider that handles auth token management, WebView detection,
 * cookie consent, and toasts. Soft-skips Firebase Auth when public config is
 * missing so CI/SSG does not hang or throw.
 */
export function ClientProvider({ children }: { children: React.ReactNode }) {
  if (!hasClientConfig) {
    return <AuthSkippedProvider>{children}</AuthSkippedProvider>;
  }
  return <AuthReadyProvider>{children}</AuthReadyProvider>;
}
