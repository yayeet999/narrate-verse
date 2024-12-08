import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { menuItems } from "@/config/navigation";

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="h-full">
      <SidebarContent className="h-full flex-grow-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex-none">
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