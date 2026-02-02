"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Spinner size styles.
 */
const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
} as const;

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: keyof typeof sizes;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the spinner */
  label?: string;
}

/**
 * A simple loading spinner component.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 *
 * <LoadingSpinner size="lg" label="Loading images..." />
 * ```
 */
export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Loader2
        className={cn("animate-spin text-blue-600", sizes[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
