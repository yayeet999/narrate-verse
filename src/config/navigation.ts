import { Library as LibraryIcon, PenSquare, FolderOpen, Settings as SettingsIcon } from "lucide-react";

export const menuItems = [
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
    title: "Folders",
    icon: FolderOpen,
    url: "/dashboard/folders",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    url: "/dashboard/settings",
  },
];