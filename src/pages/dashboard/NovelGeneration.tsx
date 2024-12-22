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

interface OutlineChapter {
  chapterNumber: number;
  title: string;
  summary: string;
  scenes: Array<{
    id: string;
    sceneFocus: string;
    conflict: string;
    settingDetails: string;
    characterInvolvement: string[];
  }>;
}

interface Outline {
  chapters: OutlineChapter[];
  metadata: {
    totalEstimatedWordCount: number;
    mainTheme: string;
    creationTimestamp: string;
  };
}

const NovelGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [outline, setOutline] = useState<Outline | null>(null);
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
          // Fetch the generated outline
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
        // If still in progress, continue polling
      } catch (error) {
        console.error('Error checking generation status:', error);
        setError('Failed to check generation status');
        setIsLoading(false);
      }
    };

    // Poll for updates every 5 seconds
    const interval = setInterval(checkGenerationStatus, 5000);
    checkGenerationStatus(); // Initial check

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
          <h2 className="text-xl font-semibold">Novel Outline</h2>
          <p className="text-muted-foreground">
            Estimated word count: {outline.metadata.totalEstimatedWordCount}
          </p>
          <p className="text-muted-foreground">
            Main theme: {outline.metadata.mainTheme}
          </p>
        </div>

        {outline.chapters.map((chapter) => (
          <Card key={chapter.chapterNumber} className="p-4">
            <h3 className="text-lg font-medium mb-2">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {chapter.summary}
            </p>
            <div className="space-y-4">
              {chapter.scenes.map((scene) => (
                <div key={scene.id} className="pl-4 border-l-2 border-muted">
                  <p className="text-sm font-medium">{scene.sceneFocus}</p>
                  <p className="text-sm text-muted-foreground">
                    Conflict: {scene.conflict}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Setting: {scene.settingDetails}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Characters: {scene.characterInvolvement.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
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