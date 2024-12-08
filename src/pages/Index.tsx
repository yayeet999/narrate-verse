import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="relative">
      <div className="container mx-auto px-4 pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-white sm:text-7xl">
          Craft compelling stories{" "}
          <span className="relative whitespace-nowrap text-primary">
            <span className="relative">with AI</span>
          </span>{" "}
          in seconds
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-white/60">
          Transform your ideas into engaging content with our AI-powered writing assistant.
          From blog posts to novels, create professional content faster than ever.
        </p>
        <div className="mt-10 flex justify-center gap-x-6">
          <Link to="/auth/signup">
            <Button className="bg-primary text-white hover:bg-primary/90 h-12 px-8">
              Start Writing Free
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 h-12 px-8">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    title: "Blog Posts & Articles",
    description: "Generate engaging blog posts and articles optimized for your target audience.",
  },
  {
    title: "Creative Writing",
    description: "Create captivating stories, poems, and creative pieces with AI assistance.",
  },
  {
    title: "Marketing Copy",
    description: "Write compelling marketing copy that converts visitors into customers.",
  },
  {
    title: "Social Media Content",
    description: "Generate engaging social media posts that drive engagement.",
  },
  {
    title: "Email Templates",
    description: "Create professional email templates for various business needs.",
  },
  {
    title: "Product Descriptions",
    description: "Write compelling product descriptions that sell.",
  },
];

export default Index;