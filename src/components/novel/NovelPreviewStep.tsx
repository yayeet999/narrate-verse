import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PARAMETER_REFERENCE } from '@/lib/novel/parameterReference';
import { calculateDimensions } from '@/lib/novel/weightingSystem';

interface NovelPreviewStepProps {
  form: UseFormReturn<NovelParameters>;
  onBack: () => void;
}

export function NovelPreviewStep({ form, onBack }: NovelPreviewStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const values = form.getValues();

  const handleStartGeneration = async () => {
    try {
      setIsGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("You must be logged in to generate a novel");
        return;
      }

      console.log('Starting novel generation with parameters:', values);

      // Create a generation session
      const { data: generationSession, error: sessionError } = await supabase
        .from('story_generation_sessions')
        .insert({
          user_id: session.user.id,
          parameters: values,
          status: 'in_progress'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      console.log('Created generation session:', generationSession.id);

      // Calculate dimensions for enhanced parameters
      const dimensions = calculateDimensions(values);

      // Call the edge function with all necessary data
      const { error: functionError } = await supabase.functions.invoke('generate-novel-outline', {
        body: { 
          parameters: values,
          parameterReference: PARAMETER_REFERENCE,
          dimensions: dimensions,
          sessionId: generationSession.id
        }
      });

      if (functionError) throw functionError;

      // Navigate to the generation page
      navigate('/dashboard/create/novel/generation', {
        state: { sessionId: generationSession.id }
      });
      
    } catch (error) {
      console.error('Error starting novel generation:', error);
      toast.error('Failed to start novel generation');
      setIsGenerating(false);
    }
  };

  const renderSection = (title: string, content: React.ReactNode) => (
    <Card className="p-4 mb-4">
      <h3 className="font-medium mb-2">{title}</h3>
      {content}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Novel Settings</h2>
        <p className="text-muted-foreground">
          Review your novel parameters before starting the generation process
        </p>
      </div>

      {renderSection("Core Structure", (
        <div className="space-y-2">
          <p><span className="font-medium">Title:</span> {values.title}</p>
          <p><span className="font-medium">Novel Length:</span> {values.novelLength}</p>
          <p><span className="font-medium">Chapter Structure:</span> {values.chapterStructure}</p>
          <p><span className="font-medium">Average Chapter Length:</span> {values.averageChapterLength} words</p>
          <p><span className="font-medium">Chapter Naming Style:</span> {values.chapterNamingStyle}</p>
        </div>
      ))}

      {renderSection("Genre & Theme", (
        <div className="space-y-2">
          <p><span className="font-medium">Primary Genre:</span> {values.primaryGenre}</p>
          <p><span className="font-medium">Secondary Genre:</span> {values.secondaryGenre || 'None'}</p>
          <p><span className="font-medium">Primary Theme:</span> {values.primaryTheme}</p>
          <p><span className="font-medium">Secondary Theme:</span> {values.secondaryTheme || 'None'}</p>
        </div>
      ))}

      {renderSection("Setting & World", (
        <div className="space-y-2">
          <p><span className="font-medium">Setting Type:</span> {values.settingType}</p>
          <p><span className="font-medium">World Complexity:</span> {values.worldComplexity}/5</p>
          <p><span className="font-medium">Cultural Depth:</span> {values.culturalDepth}/5</p>
          <p><span className="font-medium">Cultural Framework:</span> {values.culturalFramework}</p>
        </div>
      ))}

      {renderSection("Characters", (
        <div className="space-y-2">
          {values.characters.map((char, index) => (
            <div key={index} className="border-b last:border-0 pb-2">
              <p><span className="font-medium">Name:</span> {char.name}</p>
              <p><span className="font-medium">Role:</span> {char.role}</p>
              <p><span className="font-medium">Archetype:</span> {char.archetype}</p>
            </div>
          ))}
        </div>
      ))}

      {renderSection("Narrative Style", (
        <div className="space-y-2">
          <p><span className="font-medium">POV:</span> {values.pov}</p>
          <p><span className="font-medium">Story Structure:</span> {values.storyStructure}</p>
          <p><span className="font-medium">Resolution Style:</span> {values.resolutionStyle}</p>
          <p><span className="font-medium">Conflict Types:</span> {values.conflictTypes.join(', ')}</p>
        </div>
      ))}

      {renderSection("Writing Style", (
        <div className="space-y-2">
          <p><span className="font-medium">Tone Formality:</span> {values.toneFormality}/5</p>
          <p><span className="font-medium">Description Density:</span> {values.descriptionDensity}/5</p>
          <p><span className="font-medium">Dialogue Balance:</span> {values.dialogueBalance}/5</p>
          <p><span className="font-medium">Pacing:</span> {values.pacingOverall}/5</p>
          <p><span className="font-medium">Emotional Intensity:</span> {values.emotionalIntensity}/5</p>
        </div>
      ))}

      {renderSection("Content Controls", (
        <div className="space-y-2">
          <p><span className="font-medium">Violence Level:</span> {values.violenceLevel}/5</p>
          <p><span className="font-medium">Adult Content Level:</span> {values.adultContentLevel}/5</p>
          <p><span className="font-medium">Profanity Level:</span> {values.profanityLevel}/5</p>
          <p><span className="font-medium">Controversial Content Handling:</span> {values.controversialHandling}</p>
        </div>
      ))}

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isGenerating}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <Button
          onClick={handleStartGeneration}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Generation...
            </>
          ) : (
            'Start Novel Generation'
          )}
        </Button>
      </div>
    </div>
  );
}