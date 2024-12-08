import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";

export const CreditsCard = () => {
  const { data: credits, isLoading: isLoadingCredits } = useUserCredits();
  
  const isLowOnCredits = credits?.credits_remaining < 5;
  const tierName = credits?.subscription_tiers?.name || 'Free';

  return (
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
  );
};