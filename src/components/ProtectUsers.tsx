"use client";

import { useAuthStore } from "@/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectUsers({ children }: { children: React.ReactNode }) {
  const uid = useAuthStore((state) => state.uid);
  const authReady = useAuthStore((state) => state.authReady);
  const router = useRouter();

  useEffect(() => {
    if (!uid) router.replace("/");
  }, [authReady, router, uid]);

  return <>{children}</>;
}
