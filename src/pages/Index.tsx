import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PenLine, Sparkles, Zap } from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "Blog Posts & Articles",
      description: "Generate engaging blog posts and articles optimized for your target audience.",
      icon: <PenLine className="h-6 w-6 text-primary" />,
    },
    {
      title: "Creative Writing",
      description: "Create captivating stories, poems, and creative pieces with AI assistance.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
    },
    {
      title: "Marketing Copy",
      description: "Write compelling marketing copy that converts visitors into customers.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="relative">
      <div className="container mx-auto px-4 pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-7xl">
          Craft compelling stories{" "}
          <span className="relative whitespace-nowrap text-primary">
            <span className="relative">with AI</span>
          </span>{" "}
          in seconds
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-600 dark:text-slate-300">
          Transform your ideas into engaging content with our AI-powered writing assistant.
          From blog posts to novels, create professional content faster than ever.
        </p>
        <div className="mt-10 flex justify-center gap-x-6">
          <Link to="/auth/signup">
            <Button 
              className="bg-primary text-white hover:bg-primary/90 h-12 px-8 hover:animate-scale-up"
              size="lg"
            >
              Start Writing Free
            </Button>
          </Link>
          <Link to="/pricing">
            <Button 
              variant="outline" 
              className="text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-white dark:border-slate-600 dark:hover:bg-slate-800 h-12 px-8 hover:animate-scale-up"
              size="lg"
            >
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 animate-fade-in hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
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