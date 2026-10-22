"use client";

import Link from "next/link";
import { navItems } from "@/constants/menuItems";
import { useNavigation } from "@/hooks/useNavigation";
import { NavItem } from "@/components/navigation";
import { CogIcon } from "lucide-react";
import { useAuthState } from "@/zustand/selectors";

export default function Header() {
  const { onLinkClick, isActive } = useNavigation();
  const { uid } = useAuthState();

  return (
    <header className="z-10 flex h-16 items-center justify-between gap-2 bg-blue-800 px-4">
      <Link
        href="/"
        onClick={onLinkClick("/")}
        className="flex min-w-0 items-center gap-1 focus-visible:outline-white"
      >
        <CogIcon size={30} className="shrink-0 text-white" aria-hidden />
        <span translate="no" className="truncate text-xl uppercase text-white sm:text-2xl">
          Generate.me
        </span>
      </Link>
      <div className="flex h-full shrink-0 items-center gap-2">
        <nav aria-label="Primary" className="hidden h-full items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              variant="header"
              isActive={isActive(item.path)}
              onClick={onLinkClick(item.path)}
            />
          ))}
        </nav>
        {!uid && (
          <div className="flex items-center gap-1 whitespace-nowrap text-sm sm:ml-2 sm:gap-2">
            <Link
              href="/login"
              className="rounded px-2 py-1 text-white hover:bg-blue-700 focus-visible:outline-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-white px-2 py-1 font-medium text-blue-900 hover:bg-blue-50 focus-visible:outline-white"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
