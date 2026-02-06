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
    <div className="flex flex-wrap gap-x-2 w-full min-h-14 items-center px-5 py-2 justify-center shrink-0 bg-white border-t border-gray-100">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-black/50 hover:text-black"
        >
          <div>{item.label}</div>
        </Link>
      ))}
      {uid && (
        <button
          onClick={handleSignOut}
          className="text-black/50 hover:text-black flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      )}
    </div>
  );
}
