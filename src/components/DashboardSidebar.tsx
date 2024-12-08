import { Link, useLocation } from "react-router-dom";
import {
  FolderOpen,
  Library,
  PenSquare,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Library",
    icon: Library,
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
    icon: Settings,
    url: "/dashboard/settings",
  },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link to={item.url} style={{ width: '100%' }}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="w-full justify-start gap-2"
                      isActive={location.pathname === item.url}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}