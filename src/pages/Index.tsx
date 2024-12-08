import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, PenLine, Sparkles, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      title: "Instant Blog Posts",
      description: "Transform your ideas into polished blog posts in minutes. Our AI assistant helps you structure, write, and refine your content.",
      icon: <PenLine className="h-6 w-6 text-primary" />,
    },
    {
      title: "Short & Medium Stories",
      description: "Create captivating stories with ease. Let our AI guide you through character development, plot structure, and narrative flow.",
      icon: <BookOpen className="h-6 w-6 text-primary" />,
    },
    {
      title: "Novels & Long-Form",
      description: "Take your writing to the next level with our premium features. Perfect for crafting detailed narratives and complex storylines.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      premium: true,
    },
    {
      title: "Interactive Storytelling",
      description: "Create dynamic narratives that respond to reader input. Build branching storylines and engaging interactive experiences.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800"
        style={{
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      />

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 pt-20 pb-16 text-center lg:pt-32">
          {/* Floating elements animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-float" />
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200/10 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed" />
          </div>

          <h1 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-7xl">
            AI-Powered Writing Tools for{" "}
            <span className="relative whitespace-nowrap text-primary">
              <span className="relative">Blogs, Stories, and Novels</span>
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-600 dark:text-slate-300">
            Transform your ideas into professionally crafted written content in minutes.
            From quick blog posts to elaborate novels, bring your stories to life.
          </p>

          {isAuthenticated ? (
            <div className="mt-10 flex justify-center">
              <Link to="/dashboard">
                <Button 
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 h-12 px-8 animate-fade-in hover:animate-scale-up"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex justify-center gap-x-6">
              <Link to="/auth/signup">
                <Button 
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 h-12 px-8 animate-fade-in hover:animate-scale-up"
                >
                  Try for Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 h-12 px-8 animate-fade-in hover:animate-scale-up"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-8 animate-fade-in hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                  {feature.premium && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Premium
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;