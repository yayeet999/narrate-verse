import { Home, Library as LibraryIcon, PenSquare, Settings as SettingsIcon } from "lucide-react";

export const menuItems = [
  {
    title: "Home",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Library",
    icon: LibraryIcon,
    url: "/dashboard/library",
  },
  {
    title: "New Content",
    icon: PenSquare,
    url: "/dashboard/new",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    url: "/dashboard/settings",
  },
];