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
 * Button look for links, so navigation stays a single `<a>` instead of a
 * button nested inside a link.
 */
export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export const buttonClassName = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) =>
  cn(
    "inline-flex items-center justify-center font-medium rounded-lg",
    "transition-all duration-200 ease-in-out",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className
  );
