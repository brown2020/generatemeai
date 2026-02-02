/**
 * UI Component Library
 *
 * Centralized exports for all base UI components.
 * Import from this file for consistent component usage.
 *
 * @example
 * ```tsx
 * import { Button, IconButton, LoadingSpinner, Skeleton } from '@/components/ui';
 * ```
 */

export { Button, type ButtonProps } from "./Button";
export { IconButton, type IconButtonProps } from "./IconButton";
export { LoadingSpinner, type LoadingSpinnerProps } from "./LoadingSpinner";
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  type SkeletonProps,
} from "./Skeleton";
