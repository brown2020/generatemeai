type MenuItem = {
  label: string;
  href: string;
  show?: "everyone" | "user_only" | "admin_only" | "guest_only";
  icon?: "home" | "user" | "settings" | "none";
  header?: boolean;
  footer?: boolean;
};
