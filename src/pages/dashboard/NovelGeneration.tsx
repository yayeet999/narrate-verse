import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

interface LocationState {
  sessionId?: string;
}

interface NovelOutline {
  title: string;
  storyDescription: string;
  chapters: Array<{
    chapterNumber: number;
    chapterName: string;
    chapterSummary: string;
    keyPlotPoints: string[];
  }>;
  characters: Array<{
    name: string;
    role: string;
    characterArc: string;
  }>;
  themes: string[];
  worldDetails: {
    setting: string;
    worldComplexity: number;
    culturalDepth: number;
  };
  additionalNotes: string;
}

const NovelGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [outline, setOutline] = useState<NovelOutline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionId } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!sessionId) {
      toast.error('No generation session found');
      navigate('/dashboard/create/novel/setup');
      return;
    }

    const checkGenerationStatus = async () => {
      try {
        console.log('Checking generation status for session:', sessionId);
        
        const { data: session, error: sessionError } = await supabase
          .from('story_generation_sessions')
          .select('status, parameters')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        console.log('Session status:', session.status);

        if (session.status === 'completed') {
          const { data: outlineData, error: outlineError } = await supabase
            .from('story_generation_data')
            .select('content')
            .eq('session_id', sessionId)
            .eq('data_type', 'outline')
            .single();

          if (outlineError) throw outlineError;

          console.log('Fetched outline data:', outlineData);
          
          if (!outlineData?.content) {
            throw new Error('No outline content found');
          }

          setOutline(JSON.parse(outlineData.content));
          setIsLoading(false);
        } else if (session.status === 'failed') {
          setError('Generation failed. Please try again.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking generation status:', error);
        setError('Failed to check generation status');
        setIsLoading(false);
      }
    };

    const interval = setInterval(checkGenerationStatus, 5000);
    checkGenerationStatus();

    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  const renderContent = () => {
    if (error) {
      return (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard/create/novel/setup')}>
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Generating your novel outline...</p>
            <p className="text-sm text-muted-foreground">This may take a few minutes.</p>
          </div>
        </Card>
      );
    }

    if (!outline) return null;

    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{outline.title}</h2>
          <p className="text-muted-foreground mt-2">
            {outline.storyDescription}
          </p>
        </div>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">World Details</h3>
          <p className="text-sm text-muted-foreground mb-2">{outline.worldDetails.setting}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">World Complexity</p>
              <p className="text-sm text-muted-foreground">{outline.worldDetails.worldComplexity}/5</p>
            </div>
            <div>
              <p className="text-sm font-medium">Cultural Depth</p>
              <p className="text-sm text-muted-foreground">{outline.worldDetails.culturalDepth}/5</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Themes</h3>
          <div className="flex flex-wrap gap-2">
            {outline.themes.map((theme, index) => (
              <span key={index} className="px-2 py-1 bg-muted rounded-md text-sm">
                {theme}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Characters</h3>
          <div className="space-y-4">
            {outline.characters.map((character, index) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <p className="font-medium">{character.name}</p>
                <p className="text-sm text-muted-foreground">Role: {character.role}</p>
                <p className="text-sm text-muted-foreground">{character.characterArc}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {outline.chapters.map((chapter) => (
            <Card key={chapter.chapterNumber} className="p-4">
              <h3 className="text-lg font-medium mb-2">
                Chapter {chapter.chapterNumber}: {chapter.chapterName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {chapter.chapterSummary}
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Key Plot Points:</p>
                <ul className="list-disc list-inside space-y-1">
                  {chapter.keyPlotPoints.map((point, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        {outline.additionalNotes && (
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
            <p className="text-sm text-muted-foreground">{outline.additionalNotes}</p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/create/novel/setup')}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Setup
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">Novel Generation</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Generating your novel outline...' : 'Review your generated outline'}
          </p>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default NovelGeneration;