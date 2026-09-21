"use client";

import { RouteErrorPanel } from "@/components/RouteErrorPanel";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorPanel
      error={error}
      reset={reset}
      title="Something went wrong"
      message="An unexpected error occurred. Please try again."
      logLabel="Unhandled error:"
    />
  );
}
