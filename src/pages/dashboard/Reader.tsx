import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoonIcon, SunIcon, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";

type Content = Tables<"content">;

const Reader = () => {
  const { id } = useParams();
  const [fontSize, setFontSize] = useState(16);
  const { theme, setTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Content;
    }
  });

  const WORDS_PER_PAGE = 300;
  const words = content?.content.split(" ") || [];
  const totalPages = Math.ceil(words.length / WORDS_PER_PAGE);
  const currentPageWords = words.slice(
    (currentPage - 1) * WORDS_PER_PAGE,
    currentPage * WORDS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-[60vh]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{content?.title}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
          >
            A-
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
          >
            A+
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" disabled>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        className="prose dark:prose-invert mx-auto mb-6 min-h-[60vh]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {currentPageWords.join(" ")}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Reader;