"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * IconButton variant styles.
 * Using standard Tailwind CSS colors (blue, gray, red) for compatibility.
 */
const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 focus-visible:ring-red-500",
  outline:
    "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500",
} as const;

/**
 * IconButton size styles.
 */
const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

/**
 * Icon sizes corresponding to button sizes.
 */
const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

/**
 * IconButton component props.
 */
export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon to display - required */
  icon: ReactNode;
  /**
   * Accessible label for the button - required for accessibility.
   * This is used for aria-label and tooltip.
   */
  label: string;
  /** Visual style variant */
  variant?: keyof typeof variants;
  /** Size of the button */
  size?: keyof typeof sizes;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Whether to show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * An accessible icon-only button component.
 *
 * The `label` prop is required for accessibility - it provides
 * screen reader text and optional tooltip.
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<Trash2 />}
 *   label="Delete item"
 *   variant="danger"
 * />
 *
 * <IconButton
 *   icon={<Download />}
 *   label="Download file"
 *   variant="ghost"
 *   size="sm"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "ghost",
      size = "md",
      loading = false,
      showTooltip = true,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={label}
        title={showTooltip ? label : undefined}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // Variant and size
          variants[variant],
          sizes[size],
          // States
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className={cn("animate-spin", iconSizes[size])}
            aria-hidden="true"
          />
        ) : (
          <span className={iconSizes[size]} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="sr-only">{label}</span>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
