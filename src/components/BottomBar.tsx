"use client";

import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";

export default function BottomBar() {
  const { navigate, getNavItemClassName } = useNavigation();

  return (
    <div className="flex items-center z-20 h-16 justify-between md:hidden bg-blue-800 overflow-hidden">
      {navItems.map((item, index) => (
        <div
          key={index}
          className={getNavItemClassName(
            item.path,
            "flex flex-col items-center px-3 py-2 grow cursor-pointer text-white hover:text-white hover:opacity-100 transition-colors duration-300"
          )}
          onClick={() => navigate(item.path)}
        >
          <div className="h-9 aspect-square">
            <item.icon size={30} className="h-full w-full object-cover" />
          </div>
          <div className="text-xs">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
