"use client";

import Link from "next/link";
import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { NavItem } from "@/components/navigation";
import { CogIcon } from "lucide-react";
import { useAuthState } from "@/zustand/selectors";

export default function Header() {
  const { navigateHome, navigate, isActive } = useNavigation();
  const { uid } = useAuthState();

  return (
    <div className="z-10 flex h-16 items-center justify-between bg-blue-800 px-4">
      <button className="flex cursor-pointer items-center" onClick={navigateHome}>
        <CogIcon size={30} className="text-white" />
        <span className="whitespace-nowrap text-2xl uppercase text-white">Generate.me</span>
      </button>
      <div className="flex h-full items-center gap-2 opacity-0 md:opacity-100">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            variant="header"
            isActive={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
        {!uid && (
          <div className="ml-2 flex items-center gap-2 text-sm text-white">
            <Link
              href="/login"
              className="rounded px-2 py-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-white px-2 py-1 font-medium text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
