import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserCredits } from "@/hooks/useUserCredits";

export const QuickActionsCard = () => {
  const navigate = useNavigate();
  const { data: credits } = useUserCredits();
  
  const isLowOnCredits = credits?.credits_remaining < 5;
  const tierName = credits?.subscription_tiers?.name || 'Free';

  return (
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
  );
};