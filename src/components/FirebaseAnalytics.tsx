"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { logClientPageView } from "@/firebase/analyticsClient";

type FirebaseAnalyticsProps = {
  enabled: boolean;
};

export function FirebaseAnalytics({ enabled }: FirebaseAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    const path = search ? `${pathname}?${search}` : pathname;
    void logClientPageView(path, () => current);
    return () => {
      current = false;
    };
  }, [enabled, pathname, search]);

  return null;
}
