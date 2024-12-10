import React from 'react';
import { StorySettings } from '@/types/story';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomInstructionsStepProps {
  form: UseFormReturn<StorySettings>;
}

export function CustomInstructionsStep({ form }: CustomInstructionsStepProps) {
  const { watch, setValue } = form;
  const settings = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">
          Additional Instructions
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Provide any specific requirements or notes for your story
        </p>
        <Textarea
          className="min-h-[200px]"
          placeholder="Enter any additional requirements, specific scenes, or special instructions..."
          value={settings.customInstructions}
          onChange={(e) => setValue('customInstructions', e.target.value)}
        />
      </div>
    </div>
  );
}