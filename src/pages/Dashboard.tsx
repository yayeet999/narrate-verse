import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to Narrately.ai</CardTitle>
          <CardDescription>
            Your AI-powered writing assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Start creating engaging content with the help of AI. Choose from various content types and let Narrately assist you in crafting compelling stories, articles, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;