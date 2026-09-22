"use client";

import React from "react";
import { cn } from "@/utils/cn";

export interface NavItemData {
  label: string;
  icon: React.ElementType;
  path: string;
}

export interface NavItemProps {
  item: NavItemData;
  variant: "header" | "bottom";
  isActive: boolean;
  onClick: () => void;
}

const variantStyles = {
  header: {
    container:
      "flex items-center gap-1 px-3 h-full transition duration-300 cursor-pointer hover:bg-white/20",
    iconWrapper: "h-9 aspect-square",
    label: "text-lx font-bold",
  },
  bottom: {
    container:
      "flex flex-col items-center px-3 py-2 grow cursor-pointer hover:bg-white/20 transition-colors duration-300",
    iconWrapper: "h-9 aspect-square",
    label: "text-xs font-medium",
  },
};

/**
 * Reusable navigation item for Header and BottomBar.
 * Active/inactive colors keep WCAG contrast on blue-800.
 */
export const NavItem: React.FC<NavItemProps> = ({
  item,
  variant,
  isActive,
  onClick,
}) => {
  const styles = variantStyles[variant];
  const Icon = item.icon;

  return (
    <div
      className={cn(
        styles.container,
        isActive ? "bg-white/25 text-white" : "text-blue-50"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-current={isActive ? "page" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.iconWrapper}>
        <Icon size={30} className="h-full w-full object-cover" aria-hidden />
      </div>
      <div className={styles.label}>{item.label}</div>
    </div>
  );
};

export default NavItem;
