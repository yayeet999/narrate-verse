import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CoreStructureStep } from '@/components/novel/CoreStructureStep';
import { GenreThemeStep } from '@/components/novel/GenreThemeStep';
import { SettingWorldStep } from '@/components/novel/SettingWorldStep';
import { CharactersStep } from '@/components/novel/CharactersStep';
import { NarrativeStyleStep } from '@/components/novel/NarrativeStyleStep';
import type { NovelParameters } from '@/types/novel';

type NovelSetupStep = 
  | 'core-structure'
  | 'genre-theme'
  | 'setting-world'
  | 'characters'
  | 'narrative'
  | 'writing-style'
  | 'technical'
  | 'content-controls'
  | 'review';

const STEPS: Record<NovelSetupStep, { title: string; description: string }> = {
  'core-structure': {
    title: 'Core Structure',
    description: 'Define the basic structure of your novel'
  },
  'genre-theme': {
    title: 'Genre & Theme',
    description: 'Choose your genres and themes'
  },
  'setting-world': {
    title: 'Setting & World',
    description: 'Build your world'
  },
  'characters': {
    title: 'Characters',
    description: 'Create your cast of characters'
  },
  'narrative': {
    title: 'Narrative Style',
    description: 'Choose your storytelling approach'
  },
  'writing-style': {
    title: 'Writing Style',
    description: 'Define the tone and style'
  },
  'technical': {
    title: 'Technical Details',
    description: 'Set technical preferences'
  },
  'content-controls': {
    title: 'Content Controls',
    description: 'Set content guidelines'
  },
  'review': {
    title: 'Review',
    description: 'Review your choices'
  }
};

const NovelSetup = () => {
  const navigate = useNavigate();
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
      default:
        return <div>Step {currentStep} is under construction</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard/create')}>
                Create
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Novel Setup</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Novel Setup</h1>
          <div className="flex space-x-2 text-sm text-muted-foreground overflow-x-auto pb-2">
            {Object.entries(STEPS).map(([step, { title }], index) => (
              <div key={step} className="flex items-center whitespace-nowrap">
                <button
                  onClick={() => handleStepClick(step as NovelSetupStep)}
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
        </div>
      </div>

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

      <Card className="p-6">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderCurrentStep()}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStepIndex === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStepIndex === totalSteps ? 'Complete' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NovelSetup;
