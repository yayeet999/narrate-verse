import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ScrollText, Book, Gamepad } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contentTypes = [
  {
    id: "blog",
    title: "Blog Post",
    description: "Write engaging articles and blog posts",
    icon: BookOpen,
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
    icon: Book,
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
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      console.log('User subscription data:', data);
      return data;
    },
  });

  const handleContentTypeSelect = async (contentType: string) => {
    console.log('Selected content type:', contentType);
    
    if (isLoading) {
      toast.error("Please wait while we load your subscription information");
      return;
    }

    if (!userSubscription) {
      toast.error("Unable to verify your subscription status");
      return;
    }

    const { data: existingContent } = await supabase
      .from('content')
      .select('id')
      .eq('user_id', userSubscription.user_id);

    const contentCount = existingContent?.length || 0;
    const maxContent = userSubscription.subscription_tiers.max_content_count;

    if (maxContent !== -1 && contentCount >= maxContent) {
      toast.error(
        "You've reached your content limit. Please upgrade your subscription to create more content.",
        {
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing"),
          },
        }
      );
      return;
    }

    // Navigate to the appropriate creation page
    navigate(`/dashboard/editor/${contentType}`);
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
            )
          })}
        </div>

        {userSubscription?.subscription_tiers?.max_content_count !== -1 && (
          <p className="text-sm text-muted-foreground text-center">
            Free trial users can create up to {userSubscription?.subscription_tiers?.max_content_count} pieces of content.{' '}
            <button
              onClick={() => navigate('/pricing')}
              className="text-primary hover:underline"
            >
              Upgrade for unlimited content
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default CreateContent;