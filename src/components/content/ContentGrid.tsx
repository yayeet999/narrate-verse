import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type Content = Tables<"content">;

interface ContentGridProps {
  items: Content[];
  isLoading: boolean;
  onItemClick: (item: Content) => void;
}

export const ContentGrid = ({ items, isLoading, onItemClick }: ContentGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onItemClick(item)}
        >
          <CardHeader>
            <CardTitle className="line-clamp-2">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">No thumbnail</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Created {format(new Date(item.created_at), "MMM d, yyyy")}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};