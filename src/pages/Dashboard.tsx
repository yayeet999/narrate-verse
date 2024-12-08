import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="grid gap-6">
              <section>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                <p className="text-muted-foreground">
                  Here's an overview of your content
                </p>
              </section>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold">Recent Content</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't created any content yet
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold">Folders</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize your content in folders
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Create new content or manage existing ones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;