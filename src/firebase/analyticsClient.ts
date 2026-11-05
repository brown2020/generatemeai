import { getApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

import { hasClientConfig, hasMeasurementId } from "./firebaseClient";

let analytics: Analytics | null = null;
let starting: Promise<Analytics | null> | null = null;
/**
 * getAnalytics sends the first page_view for the URL at init time.
 * The first still-current caller must not log that view again.
 */
let automaticPageViewPending = false;
let lastLoggedPath: string | null = null;

async function ensureAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;
  if (starting) return starting;
  if (typeof window === "undefined" || !hasClientConfig || !hasMeasurementId) {
    return null;
  }

  automaticPageViewPending = true;
  starting = (async () => {
    try {
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      if (!(await isSupported())) return null;
      analytics = getAnalytics(getApp());
      return analytics;
    } catch {
      return null;
    }
  })();

  return starting;
}

/**
 * Logs a client navigation. No-ops until analytics has been allowed to start,
 * and skips the page_view getAnalytics already sent at initialization.
 */
export async function logClientPageView(
  path: string,
  isCurrent: () => boolean
): Promise<void> {
  const instance = await ensureAnalytics();
  if (!instance || !isCurrent()) return;

  if (automaticPageViewPending) {
    automaticPageViewPending = false;
    lastLoggedPath = path;
    return;
  }

  if (lastLoggedPath === path) return;
  lastLoggedPath = path;

  const { logEvent } = await import("firebase/analytics");
  logEvent(instance, "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
