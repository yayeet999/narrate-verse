import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/navigation/Navbar";
import Library from "./dashboard/Library";
import Reader from "./dashboard/Reader";

const DashboardOverview = () => (
  <div className="container mx-auto max-w-7xl p-4">
    <div className="grid gap-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here's an overview of your content
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">Recent Content</h3>
          <p className="text-sm text-muted-foreground mt-2">
            You haven't created any content yet
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">Folders</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Organize your content in folders
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Create new content or manage existing ones
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={true} isAuthPage={false} />
      <SidebarProvider defaultOpen>
        <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="library" element={<Library />} />
              <Route path="read/:id" element={<Reader />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;