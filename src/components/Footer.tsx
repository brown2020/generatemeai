"use client";

import { MENU_ITEMS } from "@/constants/menuItems";
import { useAuthStore } from "@/zustand/useAuthStore";
import Link from "next/link";

export default function Footer() {
  const uid = useAuthStore((s) => s.uid);

  // Simplified filter: show footer items that are visible to everyone,
  // guests, or authenticated users based on their state
  const menuItems = MENU_ITEMS.filter((item) => {
    if (!item.footer) return false;
    if (item.show === "everyone" || item.show === "guest_only") return true;
    return item.show === "user_only" && !!uid;
  });

  return (
    <div className="flex flex-wrap space-x-2 w-full h-14 items-center px-5 justify-center shrink-0">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-black/50 hover:text-black/100"
        >
          <div>{item.label}</div>
        </Link>
      ))}
    </div>
  );
}
