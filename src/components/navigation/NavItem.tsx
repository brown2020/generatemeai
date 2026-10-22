"use client";

import React, { type MouseEvent } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/zustand/useAuthStore";

export interface NavItemData {
  label: string;
  icon: React.ElementType;
  path: string;
}

export interface NavItemProps {
  item: NavItemData;
  variant: "header" | "bottom";
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

const variantStyles = {
  header: {
    container: "flex h-full items-center gap-1 px-3 transition-colors duration-300 hover:bg-white/20",
    iconWrapper: "h-9 aspect-square",
    label: "text-lg font-bold",
  },
  bottom: {
    container: "flex grow flex-col items-center px-3 py-2 transition-colors duration-300 hover:bg-white/20",
    iconWrapper: "h-9 aspect-square",
    label: "text-xs font-medium",
  },
};

/**
 * Reusable navigation link for Header and BottomBar.
 * Active/inactive colors keep WCAG contrast on blue-800.
 */
export const NavItem: React.FC<NavItemProps> = ({
  item,
  variant,
  isActive,
  onClick,
}) => {
  const isSignedIn = useAuthStore((s) => Boolean(s.uid));
  const styles = variantStyles[variant];
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      // Signed out, these protected routes only prefetch the proxy's /login redirect.
      prefetch={isSignedIn ? undefined : false}
      className={cn(
        styles.container,
        "focus-visible:outline-white focus-visible:-outline-offset-4",
        isActive ? "bg-white/25 text-white" : "text-blue-50"
      )}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={styles.iconWrapper}>
        <Icon size={30} className="h-full w-full object-cover" aria-hidden="true" />
      </span>
      <span className={styles.label}>{item.label}</span>
    </Link>
  );
};

export default NavItem;
