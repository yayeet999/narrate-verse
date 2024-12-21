import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ScrollText, Book, Gamepad, PenTool } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contentTypes = [
  {
    id: "blog",
    title: "Blog Post",
    description: "Generate SEO-optimized articles and blog posts",
    icon: Book,
    color: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
  },
  {
    id: "story",
    title: "Short Story",
    description: "Create captivating short stories",
    icon: ScrollText,
    color: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
  },
  {
    id: "novel",
    title: "Novel",
    description: "Write your next bestselling novel",
    icon: PenTool,
    color: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-500",
  },
  {
    id: "interactive_story",
    title: "Interactive Story",
    description: "Create engaging interactive narratives",
    icon: Gamepad,
    color: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-500",
  },
];

const CreateContent = () => {
  const navigate = useNavigate();
  
  const { data: userSubscription, isLoading } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: async () => {
      console.log('Fetching user subscription...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No subscription found for user');
        return null;
      }

      console.log('User subscription data:', data[0]);
      return data[0];
    },
    retry: false,
  });

  const handleContentTypeSelect = async (contentType: string) => {
    console.log('Selected content type:', contentType);
    
    if (isLoading) {
      toast.error("Please wait while we load your subscription information");
      return;
    }

    if (!userSubscription) {
      toast.error("Unable to verify your subscription status. Please try refreshing the page.");
      return;
    }

    if (contentType === 'blog') {
      navigate('/dashboard/create/blog');
    } else if (contentType === 'story') {
      navigate('/dashboard/create/story');
    } else if (contentType === 'novel') {
      navigate('/dashboard/create/novel');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Content</h1>
          <p className="text-muted-foreground mt-2">
            Choose the type of content you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => handleContentTypeSelect(type.id)}
              >
                <CardContent className="p-6">
                  <div className={`rounded-lg ${type.color} p-4 mb-4 transition-colors duration-300`}>
                    <Icon className={`w-8 h-8 ${type.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
