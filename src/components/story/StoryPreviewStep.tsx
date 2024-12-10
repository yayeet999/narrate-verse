import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Save } from 'lucide-react';

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedContent);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Preview Your Story</h2>
        <p className="text-muted-foreground">Review and edit your generated story before saving</p>
      </div>

      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="min-h-[400px] font-mono"
        placeholder="Your story content will appear here..."
        disabled={isLoading}
      />

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