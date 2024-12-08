import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Library from "./dashboard/Library";
import Reader from "./dashboard/Reader";

interface UserCredits {
  credits_remaining: number;
  subscription_tiers: {
    name: string;
  } | null;
}

const fetchUserCredits = async () => {
  console.log('Fetching user credits...');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    console.error('No session found when fetching credits');
    throw new Error('No session found');
  }

  console.log('Fetching credits for user:', session.user.id);
  
  // First try to get existing credits with proper user_id filter
  const { data: existingCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select(`
      credits_remaining,
      subscription_tiers (
        name
      )
    `)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching credits:', fetchError);
    throw fetchError;
  }

  if (existingCredits) {
    console.log('Found existing credits:', existingCredits);
    return existingCredits as UserCredits;
  }

  console.log('No credits found, creating new credits record...');
  
  // Get the free tier ID
  const { data: freeTier, error: tierError } = await supabase
    .from('subscription_tiers')
    .select('id')
    .eq('name', 'Free')
    .single();

  if (tierError) {
    console.error('Error fetching free tier:', tierError);
    throw tierError;
  }

  if (!freeTier?.id) {
    console.error('No free tier found');
    return {
      credits_remaining: 0,
      subscription_tiers: {
        name: 'Free'
      }
    } as UserCredits;
  }

  // Create new user credits with explicit user_id and required fields
  const { data: newCredits, error: insertError } = await supabase
    .from('user_credits')
    .insert({
      user_id: session.user.id,
      credits_remaining: 10,
      tier_id: freeTier.id,
      last_reset: new Date().toISOString()
    })
    .select(`
      credits_remaining,
      subscription_tiers (
        name
      )
    `)
    .single();

  if (insertError) {
    console.error('Error creating user credits:', insertError);
    throw insertError;
  }

  console.log('Created new credits:', newCredits);
  return newCredits as UserCredits;
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['userCredits'],
    queryFn: fetchUserCredits,
  });

  const isLowOnCredits = credits?.credits_remaining < 5;
  const tierName = credits?.subscription_tiers?.name || 'Free';

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here's an overview of your content
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/create')} 
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Content
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Credits Status
              <span className={`text-sm font-normal ${isLowOnCredits ? 'text-destructive' : ''}`}>
                {tierName} Tier
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCredits ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                `${credits?.credits_remaining || 0} Credits`
              )}
            </div>
            {isLowOnCredits && tierName === 'Free' && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're running low on credits! Consider upgrading to continue creating content.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Your recent drafts and stories will appear here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/library')}
            >
              View Library
            </Button>
            {isLowOnCredits && tierName === 'Free' && (
              <Button 
                variant="default" 
                className="w-full justify-start"
                onClick={() => navigate('/dashboard/subscription')}
              >
                Upgrade Plan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
