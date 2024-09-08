"use client";

import { MENU_ITEMS } from "@/constants/menuItems";
import { useAuthStore } from "@/zustand/useAuthStore";
import Link from "next/link";

export default function Footer() {
  const uid = useAuthStore((s) => s.uid);

  const menuItems = MENU_ITEMS.filter((item) => {
    if (item.footer && item.show === "everyone") return true;
    if (item.footer && item.show === "guest_only") return true;
    if (item.footer && item.show === "user_only") return uid;
    return false;
  });

  return (
    <div className="flex flex-wrap space-x-2 w-full h-14 items-center px-5 justify-center flex-shrink-0">
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
