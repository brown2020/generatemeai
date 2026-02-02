"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Button variant styles.
 * Using standard Tailwind CSS colors (blue, gray, red) for compatibility.
 */
const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
  outline:
    "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500",
} as const;

/**
 * Button size styles.
 */
const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
} as const;

/**
 * Button component props.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: keyof typeof variants;
  /** Size of the button */
  size?: keyof typeof sizes;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Icon to display before the text */
  leftIcon?: ReactNode;
  /** Icon to display after the text */
  rightIcon?: ReactNode;
  /** Makes button full width */
  fullWidth?: boolean;
}

/**
 * A versatile button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 *
 * <Button variant="secondary" loading>
 *   Saving...
 * </Button>
 *
 * <Button variant="ghost" leftIcon={<Icon />}>
 *   With icon
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
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
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium rounded-lg",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // Variant and size
          variants[variant],
          sizes[size],
          // States
          isDisabled && "opacity-50 cursor-not-allowed",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
