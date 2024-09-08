"use client";

import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/constants/menuItems";

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center z-20 h-16 justify-between md:hidden bg-blue-800 overflow-hidden">
      {navItems.map((item, index) => (
        <div
          key={index}
          className={`flex flex-col items-center px-3 py-2 flex-grow cursor-pointer text-white hover:text-white hover:opacity-100 transition-colors duration-300 ${
            pathname.slice(0, 5) === item.path.slice(0, 5) && pathname !== "/"
              ? "opacity-100 bg-white/30"
              : "opacity-50"
          }`}
          onClick={() => {
            setTimeout(() => router.push(item.path), 100);
          }}
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
