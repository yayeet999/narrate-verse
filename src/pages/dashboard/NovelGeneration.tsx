import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  sessionId?: string;
}

const NovelGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [outline, setOutline] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { sessionId } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!sessionId) {
      toast.error('No generation session found');
      navigate('/dashboard/create/novel/setup');
      return;
    }

    const checkGenerationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('story_generation_sessions')
          .select('status, parameters')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        if (data.status === 'completed') {
          // Fetch the generated outline
          const { data: outlineData, error: outlineError } = await supabase
            .from('story_generation_data')
            .select('content')
            .eq('session_id', sessionId)
            .eq('data_type', 'outline')
            .single();

          if (outlineError) throw outlineError;

          setOutline(outlineData.content);
          setIsLoading(false);
        } else if (data.status === 'failed') {
          toast.error('Generation failed. Please try again.');
          setIsLoading(false);
        }
        // If still in progress, continue polling
      } catch (error) {
        console.error('Error checking generation status:', error);
        toast.error('Failed to check generation status');
        setIsLoading(false);
      }
    };

    // Poll for updates every 5 seconds
    const interval = setInterval(checkGenerationStatus, 5000);
    checkGenerationStatus(); // Initial check

    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  return (
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

      <Card className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Generating your novel outline...</p>
          </div>
        ) : (
          <Textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            className="min-h-[400px] font-mono text-sm md:text-base lg:text-lg"
            placeholder="Your generated outline will appear here..."
          />
        )}
      </Card>
    </div>
  );
};

export default NovelGeneration;