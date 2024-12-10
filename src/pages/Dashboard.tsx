import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileMenu } from "@/components/dashboard/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import Library from "./dashboard/Library";
import Reader from "./dashboard/Reader";
import Settings from "./dashboard/Settings";
import CreateContent from "./dashboard/Create";
import BlogPost from "./dashboard/BlogPost";
import StoryPost from "./dashboard/StoryPost";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import Footer from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      await supabase.auth.signOut({ scope: 'local' });
      console.log('Local session cleared');
      navigate('/auth/login', { replace: true });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      navigate('/auth/login', { replace: true });
      toast.error('There was an issue signing out, but you have been redirected to login');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Narrately.ai
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <MobileMenu 
                onSignOut={handleSignOut}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="library" element={<Library />} />
              <Route path="create" element={<CreateContent />} />
              <Route path="create/blog" element={<BlogPost />} />
              <Route path="create/story" element={<StoryPost />} />
              <Route path="read/:id" element={<Reader />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
