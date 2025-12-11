"use client";

import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { NavItem } from "@/components/navigation";
import { CogIcon } from "lucide-react";

export default function Header() {
  const { navigateHome, navigate, isActive } = useNavigation();

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
          <NavItem
            key={index}
            item={item}
            variant="header"
            isActive={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </div>
  );
}
