import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptionStatus } from "@/utils/subscriptionUtils";

const NovelBuffer = () => {
  const navigate = useNavigate();
  
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['userSubscription'],
    queryFn: getUserSubscriptionStatus
  });

  const handleContinue = () => {
    navigate('/dashboard/create/novel/setup');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Novel Generation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You're about to begin creating a full-length novel. Our AI will guide you through
              the process of defining your story's world, characters, and plot elements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="p-6">
              <h2 className="font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                What to Expect
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Detailed character development</li>
                <li>• World-building assistance</li>
                <li>• Plot structure guidance</li>
                <li>• Chapter-by-chapter generation</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Estimated Timeline
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Setup: 15-20 minutes</li>
                <li>• Initial generation: 30-45 minutes</li>
                <li>• Revisions: As needed</li>
                <li>• Full process: 1-2 hours</li>
              </ul>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={handleContinue}
              className="animate-fade-in"
            >
              Begin Novel Creation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NovelBuffer;