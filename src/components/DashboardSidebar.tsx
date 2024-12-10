import { Link, useLocation } from 'react-router-dom';
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

interface DashboardSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const location = useLocation();

  const isActiveRoute = (url: string) => {
    if (url === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(url) && url !== '/dashboard';
  };

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800">
      <SidebarContent className="md:pt-16">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link to={item.url} style={{ width: '100%' }}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`w-full justify-start gap-2 ${
                        isActiveRoute(item.url)
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                      }`}
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