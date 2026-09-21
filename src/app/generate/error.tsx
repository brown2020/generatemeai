"use client";

import { RouteErrorPanel } from "@/components/RouteErrorPanel";

export default function GenerateError({
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
      title="Generation Error"
      message="Something went wrong with the image generator. Please try again."
      logLabel="Generate page error:"
    />
  );
}
