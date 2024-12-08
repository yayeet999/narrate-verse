import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const tiers = [
    {
      name: "Free Tier",
      description: "Get started at no cost. Perfect for trying out short content creation.",
      price: "Free",
      features: [
        "Limited credits to generate blog posts",
        "Basic writing tools and auto-saving",
        "View-only access to novel interface",
        "Community support",
      ],
      buttonText: "Try for Free",
      buttonLink: "/auth/signup",
      highlighted: false,
    },
    {
      name: "Paid Tier",
      description: "Expand your creative horizons with full access and generous credits.",
      price: "$20/month",
      features: [
        "Larger monthly credit allowance",
        "Full novel writing capabilities",
        "Interactive storytelling features",
        "Priority support",
      ],
      buttonText: "Upgrade Now",
      buttonLink: "/auth/signup",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Choose Your Writing Experience
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Start with our Free Tier or unlock full potential with our Paid Tier. No pressure, upgrade anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative flex flex-col ${
                tier.highlighted 
                  ? 'border-primary shadow-lg dark:border-primary' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="mt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mt-2 mb-8">
                  <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {tier.price}
                  </span>
                </div>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="ml-3 text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={tier.buttonLink} className="w-full">
                  <Button 
                    className={`w-full ${
                      tier.highlighted 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 dark:text-slate-300">
            Still unsure? Start free and upgrade when you're ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;