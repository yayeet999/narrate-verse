import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RecentContentCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Your recent drafts and stories will appear here
        </div>
      </CardContent>
    </Card>
  );
};