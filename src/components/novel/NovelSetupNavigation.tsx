import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NovelSetupNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  showPreview?: boolean;
}

export function NovelSetupNavigation({ 
  currentStepIndex, 
  totalSteps, 
  onPrevious, 
  onNext,
  showPreview 
}: NovelSetupNavigationProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={currentStepIndex === 1 && !showPreview}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {showPreview ? 'Back to Settings' : 'Previous'}
      </Button>
      {!showPreview && (
        <Button onClick={onNext}>
          {currentStepIndex === totalSteps ? 'Preview' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}