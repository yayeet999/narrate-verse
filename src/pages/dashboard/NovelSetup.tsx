import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { CoreStructureStep } from '@/components/novel/CoreStructureStep';
import { GenreThemeStep } from '@/components/novel/GenreThemeStep';
import { SettingWorldStep } from '@/components/novel/SettingWorldStep';
import { CharactersStep } from '@/components/novel/CharactersStep';
import { NarrativeStyleStep } from '@/components/novel/NarrativeStyleStep';
import { WritingStyleStep } from '@/components/novel/WritingStyleStep';
import { TechnicalDetailsStep } from '@/components/novel/TechnicalDetailsStep';
import { ContentControlsStep } from '@/components/novel/ContentControlsStep';
import { NovelSetupHeader } from '@/components/novel/NovelSetupHeader';
import { NovelSetupProgress } from '@/components/novel/NovelSetupProgress';
import { NovelSetupStepSelector } from '@/components/novel/NovelSetupStepSelector';
import { NovelSetupNavigation } from '@/components/novel/NovelSetupNavigation';
import type { NovelParameters, NovelSetupStep, STEPS } from '@/types/novel';

const NovelSetup = () => {
  const [currentStep, setCurrentStep] = useState<NovelSetupStep>('core-structure');
  
  const form = useForm<NovelParameters>({
    defaultValues: {
      novelLength: '50k-100k',
      chapterStructure: 'variable',
      averageChapterLength: 2500,
      chapterNamingStyle: 'both',
      worldComplexity: 3,
      culturalDepth: 3,
      toneFormality: 3,
      toneDescriptive: 3,
      dialogueBalance: 3,
      descriptionDensity: 3,
      pacingOverall: 3,
      pacingVariance: 3,
      emotionalIntensity: 3,
      metaphorFrequency: 3,
      flashbackUsage: 3,
      foreshadowingIntensity: 3,
      languageComplexity: 3,
      violenceLevel: 2,
      adultContentLevel: 1,
      profanityLevel: 1,
      controversialHandling: 'careful',
      characters: [],
      conflictTypes: ['person_vs_self']
    }
  });

  const totalSteps = Object.keys(STEPS).length;
  const currentStepIndex = Object.keys(STEPS).indexOf(currentStep) + 1;

  const handleStepClick = (step: NovelSetupStep) => {
    const steps = Object.keys(STEPS) as NovelSetupStep[];
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(step);
    
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    const steps = Object.keys(STEPS) as NovelSetupStep[];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps = Object.keys(STEPS) as NovelSetupStep[];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'core-structure':
        return <CoreStructureStep form={form} />;
      case 'genre-theme':
        return <GenreThemeStep form={form} />;
      case 'setting-world':
        return <SettingWorldStep form={form} />;
      case 'characters':
        return <CharactersStep form={form} />;
      case 'narrative':
        return <NarrativeStyleStep form={form} />;
      case 'writing-style':
        return <WritingStyleStep form={form} />;
      case 'technical':
        return <TechnicalDetailsStep form={form} />;
      case 'content-controls':
        return <ContentControlsStep form={form} />;
      default:
        return <div>Step {currentStep} is under construction</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <NovelSetupHeader />
      
      <NovelSetupProgress 
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
      />

      <Card className="p-6">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderCurrentStep()}
          
          <NovelSetupNavigation
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </form>
      </Card>
    </div>
  );
};

export default NovelSetup;