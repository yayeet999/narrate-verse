import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StoryPreviewStepProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export const StoryPreviewStep = ({ 
  content, 
  onSave, 
  onBack,
  isLoading 
}: StoryPreviewStepProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const WORDS_PER_PAGE = 500; // Adjust this value to control words per page
  const words = editedContent.split(/\s+/);
  const totalPages = Math.ceil(words.length / WORDS_PER_PAGE);
  
  const getCurrentPageContent = () => {
    const start = (currentPage - 1) * WORDS_PER_PAGE;
    const end = start + WORDS_PER_PAGE;
    return words.slice(start, end).join(' ');
  };

  const handleContentChange = (newContent: string) => {
    const allWords = editedContent.split(/\s+/);
    const start = (currentPage - 1) * WORDS_PER_PAGE;
    const end = start + WORDS_PER_PAGE;
    
    // Replace only the current page's content
    allWords.splice(start, end - start, ...newContent.split(/\s+/));
    setEditedContent(allWords.join(' '));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedContent);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Preview Your Story</h2>
        <p className="text-muted-foreground">Review and edit your generated story before saving</p>
        <p className="text-sm text-muted-foreground mt-2">
          Page {currentPage} of {totalPages} ({words.length} words total)
        </p>
      </div>

      <Textarea
        value={getCurrentPageContent()}
        onChange={(e) => handleContentChange(e.target.value)}
        className="min-h-[400px] font-mono"
        placeholder="Your story content will appear here..."
        disabled={isLoading}
      />

      <div className="flex justify-center my-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNumber)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading || isSaving}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Story'}
        </Button>
      </div>
    </div>
  );
};