import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

type Content = Tables<"content">;

const Library = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<Content["type"]>("blog");

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", selectedType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("type", selectedType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Content[];
    }
  });

  const handleContentClick = (item: Content) => {
    navigate(`/dashboard/read/${item.id}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Library</h1>
      
      <Tabs defaultValue="blog" className="w-full" onValueChange={(value) => setSelectedType(value as Content["type"])}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="blog">Blogs</TabsTrigger>
          <TabsTrigger value="story">Stories</TabsTrigger>
          <TabsTrigger value="novel">Novels</TabsTrigger>
          <TabsTrigger value="interactive_story">Interactive Stories</TabsTrigger>
        </TabsList>

        {["blog", "story", "novel", "interactive_story"].map((type) => (
          <TabsContent key={type} value={type}>
            <ContentGrid
              items={content || []}
              isLoading={isLoading}
              onItemClick={handleContentClick}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Library;