import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NovelSetupStep, STEPS } from '@/types/novel';

interface NovelSetupStepSelectorProps {
  currentStep: NovelSetupStep;
  onStepClick: (step: NovelSetupStep) => void;
}

export function NovelSetupStepSelector({ 
  currentStep, 
  onStepClick 
}: NovelSetupStepSelectorProps) {
  return (
    <div className="flex space-x-2 text-sm text-muted-foreground overflow-x-auto pb-2">
      {Object.entries(STEPS).map(([step, { title }], index) => (
        <div key={step} className="flex items-center whitespace-nowrap">
          <button
            onClick={() => onStepClick(step as NovelSetupStep)}
            className={`hover:text-foreground ${
              currentStep === step ? 'text-foreground font-medium' : ''
            }`}
          >
            {title}
          </button>
          {index < Object.entries(STEPS).length - 1 && (
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}