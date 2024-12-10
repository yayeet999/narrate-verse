import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BasicSettingsStep } from '@/components/story/BasicSettingsStep';
import { WorldBuildingStep } from '@/components/story/WorldBuildingStep';
import { PacingStyleStep } from '@/components/story/PacingStyleStep';
import { CharacterCreationStep } from '@/components/story/CharacterCreationStep';
import { ThematicElementsStep } from '@/components/story/ThematicElementsStep';
import { CustomInstructionsStep } from '@/components/story/CustomInstructionsStep';
import { ReviewSettingsStep } from '@/components/story/ReviewSettingsStep';
import type { StorySettings } from '@/types/story';

const initialSettings: StorySettings = {
  basicSettings: {
    genre: '',
    length: '',
    writingStyle: ''
  },
  worldBuilding: {
    worldType: '',
    timePeriod: '',
    worldView: [],
    settingDetail: 3,
    socialCulturalElements: 3
  },
  pacingStyle: {
    plotDevelopment: 3,
    sceneDetail: 3,
    dialogNarrative: 3,
    overallMood: 3,
    dramaticHumorous: 3
  },
  characterCreation: {
    ageRange: '',
    characterRole: '',
    personalityTraits: [],
    coreDrive: '',
    moralAlignment: '',
    confidence: 3,
    decisionMaking: 3,
    predictability: 3
  },
  thematicElements: {
    coreThemes: [],
    storyEnding: '',
    moodAndFeel: []
  },
  customInstructions: ''
};

const StoryPost = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [storySettings, setStorySettings] = useState<StorySettings>(initialSettings);

  const totalSteps = 7;
  const stepTitles = [
    'Basic Settings',
    'World Building',
    'Pacing & Style',
    'Character Creation',
    'Thematic Elements',
    'Custom Instructions',
    'Review'
  ];

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return <BasicSettingsStep settings={storySettings} updateSettings={setStorySettings} />;
      case 2:
        return <WorldBuildingStep settings={storySettings} updateSettings={setStorySettings} />;
      case 3:
        return <PacingStyleStep settings={storySettings} updateSettings={setStorySettings} />;
      case 4:
        return <CharacterCreationStep settings={storySettings} updateSettings={setStorySettings} />;
      case 5:
        return <ThematicElementsStep settings={storySettings} updateSettings={setStorySettings} />;
      case 6:
        return <CustomInstructionsStep settings={storySettings} updateSettings={setStorySettings} />;
      case 7:
        return <ReviewSettingsStep settings={storySettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard/create')}>Create</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Short Story</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Story</h1>
          <p className="text-muted-foreground">
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </p>
        </div>
      </div>

      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium">{stepTitles[currentStep - 1]}</div>
          <div className="text-sm text-muted-foreground">{currentStep}/{totalSteps}</div>
        </div>
        <Progress value={(currentStep/totalSteps) * 100} className="h-2" />
      </div>

      <Card className="p-6">
        {renderCurrentStep()}
      </Card>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
            className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Next Step
            <ChevronRight className="ml-2 w-4 h-4" />
          </button>
        ) : (
          <button
            className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Generate Story
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryPost;