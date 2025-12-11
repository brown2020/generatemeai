"use client";

import React from "react";

/**
 * Navigation item data structure.
 * Matches NavItemData in types/menu.d.ts for global usage.
 */
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
      "flex items-center gap-1 px-3 h-full transition duration-300 cursor-pointer text-white hover:opacity-100",
    iconWrapper: "h-9 aspect-square",
    label: "text-lx font-bold",
  },
  bottom: {
    container:
      "flex flex-col items-center px-3 py-2 grow cursor-pointer text-white hover:text-white hover:opacity-100 transition-colors duration-300",
    iconWrapper: "h-9 aspect-square",
    label: "text-xs",
  },
};

/**
 * Reusable navigation item component for Header and BottomBar.
 */
export const NavItem: React.FC<NavItemProps> = ({
  item,
  variant,
  isActive,
  onClick,
}) => {
  const styles = variantStyles[variant];
  const activeClasses = isActive ? "opacity-100 bg-white/30" : "opacity-50";
  const Icon = item.icon;

  return (
    <div
      className={`${styles.container} ${activeClasses}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.iconWrapper}>
        <Icon size={30} className="h-full w-full object-cover" />
      </div>
      <div className={styles.label}>{item.label}</div>
    </div>
  );
};

export default NavItem;
