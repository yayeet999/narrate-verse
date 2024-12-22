import React from 'react';
import { Progress } from '@/components/ui/progress';
import { NovelSetupStep, STEPS } from '@/types/novel';

interface NovelSetupProgressProps {
  currentStep: NovelSetupStep;
  currentStepIndex: number;
  totalSteps: number;
}

export function NovelSetupProgress({ 
  currentStep, 
  currentStepIndex, 
  totalSteps 
}: NovelSetupProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <div className="text-sm font-medium">
          {STEPS[currentStep].title}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentStepIndex}/{totalSteps}
        </div>
      </div>
      <Progress 
        value={(currentStepIndex/totalSteps) * 100} 
        className="h-2" 
      />
    </div>
  );
}