"use client";

import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { CogIcon } from "lucide-react";

export default function Header() {
  const { navigateHome, navigate, getNavItemClassName } = useNavigation();

  return (
    <div className="z-10 flex items-center justify-between h-16 px-4 bg-blue-800">
      <div className="flex items-center cursor-pointer" onClick={navigateHome}>
        <CogIcon size={30} className="text-white" />
        <div className="text-2xl uppercase whitespace-nowrap text-white">
          Generate.me
        </div>
      </div>
      <div className="flex h-full gap-2 opacity-0 md:opacity-100 items-center">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={getNavItemClassName(
              item.path,
              "flex items-center gap-1 px-3 h-full transition duration-300 cursor-pointer text-white hover:opacity-100"
            )}
            onClick={() => navigate(item.path)}
          >
            <div className="h-9 aspect-square">
              <item.icon size={30} className="h-full w-full object-cover" />
            </div>
            <div className="text-lx font-bold">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
