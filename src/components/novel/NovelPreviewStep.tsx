import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NovelPreviewStepProps {
  form: UseFormReturn<NovelParameters>;
  onBack: () => void;
}

export function NovelPreviewStep({ form, onBack }: NovelPreviewStepProps) {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const values = form.getValues();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("You must be logged in to save a novel");
        return;
      }

      const { error } = await supabase
        .from('story_generation_sessions')
        .insert({
          user_id: session.user.id,
          parameters: values,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Novel parameters saved successfully!');
      navigate('/dashboard/library');
    } catch (error) {
      console.error('Error saving novel parameters:', error);
      toast.error('Failed to save novel parameters');
    } finally {
      setIsSaving(false);
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
        {Object.entries(values).map(([key, value]) => (
          <Card key={key} className="p-4">
            <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-sm text-muted-foreground">
              {Array.isArray(value) ? value.join(', ') : value?.toString()}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSaving}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save & Start Generation'}
        </Button>
      </div>
    </div>
  );
}