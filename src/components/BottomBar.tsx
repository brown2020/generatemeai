"use client";

import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { NavItem } from "@/components/navigation";

export default function BottomBar() {
  const { onLinkClick, isActive } = useNavigation();

  return (
    <nav
      aria-label="Primary"
      className="z-20 flex min-h-16 items-center justify-between overflow-hidden bg-blue-800 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          item={item}
          variant="bottom"
          isActive={isActive(item.path)}
          onClick={onLinkClick(item.path)}
        />
      ))}
    </nav>
  );
}
