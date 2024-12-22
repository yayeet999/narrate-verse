import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NovelPreviewStepProps {
  form: UseFormReturn<NovelParameters>;
  onBack: () => void;
}

export function NovelPreviewStep({ form, onBack }: NovelPreviewStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const values = form.getValues();

  const handleStartGeneration = async () => {
    try {
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("You must be logged in to generate a novel");
        return;
      }

      // For now, just show a toast - actual generation logic will be added later
      toast.success('Starting novel generation...');
      // Will be replaced with actual generation logic and navigation
      
    } catch (error) {
      console.error('Error starting novel generation:', error);
      toast.error('Failed to start novel generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Novel Settings</h2>
        <p className="text-muted-foreground">
          Review your novel parameters before starting the generation process
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Basic Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <p>{values.title}</p>
            </div>
            {values.storyDescription && (
              <div>
                <span className="text-muted-foreground">Story Description:</span>
                <p className="whitespace-pre-wrap">{values.storyDescription}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Novel Length</h3>
          <p>{values.novelLength}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Chapter Structure</h3>
          <p>{values.chapterStructure}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Average Chapter Length</h3>
          <p>{values.averageChapterLength} words</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-2">Chapter Naming Style</h3>
          <p>{values.chapterNamingStyle}</p>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isGenerating}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <Button
          onClick={handleStartGeneration}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Generation...
            </>
          ) : (
            'Start Novel Generation'
          )}
        </Button>
      </div>
    </div>
  );
}