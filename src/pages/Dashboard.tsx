import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut, Library as LibraryIcon, PenSquare, FolderOpen, Settings as SettingsIcon } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import LibraryPage from "./dashboard/Library";
import ReaderPage from "./dashboard/Reader";
import SettingsPage from "./dashboard/Settings";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

// Define menu items in one place to maintain consistency
const menuItems = [
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    console.log('Dashboard mounted');
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Dashboard session check:', { session, error });
      
      if (error) {
        console.error('Error checking session:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in again",
        });
        navigate('/auth/login');
        return;
      }
      
      if (!session) {
        console.log('No session found, redirecting to login');
        navigate('/auth/login');
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
      return;
    }
    toast({
      title: "Signed out successfully",
    });
    navigate('/');
  };

  const handleMobileNavigation = (url: string) => {
    setIsMobileMenuOpen(false);
    navigate(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800">
        <Navbar isAuthenticated={true} isAuthPage={false} />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 pt-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => handleMobileNavigation(item.url)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-2 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="read/:id" element={<ReaderPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;