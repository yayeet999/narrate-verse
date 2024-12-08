import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecentContentCard } from "./RecentContentCard";
import { QuickActionsCard } from "./QuickActionsCard";

export const DashboardOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Here's an overview of your content
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/create')} 
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Content
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentContentCard />
        <QuickActionsCard />
      </div>
    </div>
  );
};