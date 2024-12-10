import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
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
import { StoryPreviewStep } from '@/components/story/StoryPreviewStep';
import type { StorySettings } from '@/types/story';
import { supabase } from '@/integrations/supabase/client';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<StorySettings>({
    defaultValues: initialSettings
  });

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

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("You must be logged in to generate content");
        return;
      }

      const values = form.getValues();
      console.log('Generating story with values:', values);
      
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: { storyParams: values }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate story content');
      }

      if (!data?.content) {
        throw new Error('No content received from the generation service');
      }

      console.log('Generated content:', data.content);
      setGeneratedContent(data.content);
      setShowPreview(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate story content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (content: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in to save content");
        return;
      }

      const { error } = await supabase
        .from('content')
        .insert({
          user_id: session.user.id,
          title: form.getValues().basicSettings.genre,
          content: content,
          type: 'story',
          is_published: false
        });

      if (error) throw error;

      toast.success('Story saved successfully!');
      navigate('/dashboard/library');
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story. Please try again.');
    }
  };

  const renderCurrentStep = () => {
    if (showPreview) {
      return (
        <StoryPreviewStep
          content={generatedContent}
          onSave={handleSave}
          onBack={() => setShowPreview(false)}
          isLoading={isGenerating}
        />
      );
    }

    const StepComponent = {
      1: BasicSettingsStep,
      2: WorldBuildingStep,
      3: PacingStyleStep,
      4: CharacterCreationStep,
      5: ThematicElementsStep,
      6: CustomInstructionsStep,
      7: ReviewSettingsStep,
    }[currentStep];

    if (!StepComponent) return null;

    return (
      <Form {...form}>
        <form>
          <StepComponent form={form} />
        </form>
      </Form>
    );
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
            {showPreview ? 'Preview & Save' : `Step ${currentStep}: ${stepTitles[currentStep - 1]}`}
          </p>
        </div>
      </div>

      {!showPreview && (
        <div className="w-full mb-8">
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium">{stepTitles[currentStep - 1]}</div>
            <div className="text-sm text-muted-foreground">{currentStep}/{totalSteps}</div>
          </div>
          <Progress value={(currentStep/totalSteps) * 100} className="h-2" />
        </div>
      )}

      <Card className="p-6">
        {renderCurrentStep()}
      </Card>

      <div className="flex justify-between mt-6">
        {!showPreview && (
          <>
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={currentStep === 1 || isGenerating}
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                disabled={isGenerating}
              >
                Next Step
                <ChevronRight className="ml-2 w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Story'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryPost;