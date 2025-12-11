"use client";

import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { NavItem } from "@/components/navigation";

export default function BottomBar() {
  const { navigate, isActive } = useNavigation();

  return (
    <div className="flex items-center z-20 h-16 justify-between md:hidden bg-blue-800 overflow-hidden">
      {navItems.map((item, index) => (
        <NavItem
          key={index}
          item={item}
          variant="bottom"
          isActive={isActive(item.path)}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
}
