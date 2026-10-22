"use client";

import { MENU_ITEMS } from "@/constants/menuItems";
import { useAuthUid, useSignOut } from "@/hooks";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function Footer() {
  const uid = useAuthUid();
  const handleSignOut = useSignOut();

  // Simplified filter: show footer items that are visible to everyone,
  // guests, or authenticated users based on their state
  const menuItems = MENU_ITEMS.filter((item) => {
    if (!item.footer) return false;
    if (item.show === "everyone" || item.show === "guest_only") return true;
    return item.show === "user_only" && !!uid;
  });

  return (
    <footer className="flex min-h-14 w-full shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-gray-100 bg-white px-5 py-2 text-sm">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-sm text-gray-600 hover:text-black"
        >
          {item.label}
        </Link>
      ))}
      {uid && (
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1 rounded-sm text-gray-600 hover:text-black"
        >
          <LogOut className="w-3 h-3" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      )}
    </footer>
  );
}
