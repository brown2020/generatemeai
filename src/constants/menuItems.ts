import { CircleUserIcon, CogIcon, ImagesIcon } from "lucide-react";
import { NavItemData } from "@/components/navigation/NavItem";

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "About",
    href: "/about",
    show: "everyone",
    header: false,
    footer: true,
  },
  {
    label: "Terms",
    href: "/terms",
    show: "everyone",
    header: false,
    footer: true,
  },
  {
    label: "Privacy",
    href: "/privacy",
    show: "everyone",
    header: false,
    footer: true,
  },
  {
    label: "Support",
    href: "/support",
    show: "everyone",
    header: false,
    footer: true,
  },
];

/**
 * Navigation items for Header and BottomBar.
 */
export const navItems: NavItemData[] = [
  {
    label: "Generate",
    icon: CogIcon,
    path: "/generate",
  },
  {
    label: "Images",
    icon: ImagesIcon,
    path: "/images",
  },
  {
    label: "Profile",
    icon: CircleUserIcon,
    path: "/profile",
  },
];
