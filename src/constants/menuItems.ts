import { CircleUserIcon, CogIcon, ImagesIcon } from "lucide-react";

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
];

type navItemType = {
  label: string;
  icon: React.ElementType;
  path: string;
};

export const navItems: navItemType[] = [
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
