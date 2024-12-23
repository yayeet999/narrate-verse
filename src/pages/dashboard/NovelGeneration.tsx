import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { NovelGenerationHeader } from '@/components/novel/NovelGenerationHeader';
import { NovelGenerationStatus } from '@/components/novel/NovelGenerationStatus';
import { NovelOutlineDisplay } from '@/components/novel/NovelOutlineDisplay';
import type { NovelOutline } from '@/services/novel/types';

interface LocationState {
  sessionId?: string;
}

const NovelGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [outline, setOutline] = useState<NovelOutline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasStartedRefinement, setHasStartedRefinement] = useState(false);
  const { sessionId } = (location.state as LocationState) || {};

  const startRefinement = async (outlineData: NovelOutline) => {
    try {
      if (hasStartedRefinement) {
        console.log('Refinement already started, skipping');
        return;
      }

      setIsRefining(true);
      setHasStartedRefinement(true);
      console.log('Starting refinement process for session:', sessionId);

      const { error: refinementError } = await supabase.functions.invoke('generate-novel-refinement', {
        body: { 
          outline: outlineData,
          sessionId 
        }
      });

      if (refinementError) throw refinementError;

      // Wait for the refined outline to be stored
      const { data: refinedData, error: fetchError } = await supabase
        .from('story_generation_data')
        .select('content')
        .eq('session_id', sessionId)
        .eq('data_type', 'outline')
        .single();

      if (fetchError) throw fetchError;

      console.log('Refinement complete, updating UI');
      setOutline(JSON.parse(refinedData.content));
      setIsRefining(false);
      setRetryCount(0);

    } catch (error) {
      console.error('Error in refinement process:', error);
      
      if (retryCount < 3) {
        console.log(`Retrying refinement (attempt ${retryCount + 1} of 3)`);
        setRetryCount(prev => prev + 1);
        await startRefinement(outlineData);
      } else {
        toast.error('Failed to refine outline after multiple attempts');
        setIsRefining(false);
        setRetryCount(0);
      }
    }
  };

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

          const parsedOutline = JSON.parse(outlineData.content);
          setOutline(parsedOutline);
          setIsLoading(false);

          // Only start refinement if we haven't refined yet and there are no refinements
          if (!hasStartedRefinement && !parsedOutline.refinements) {
            await startRefinement(parsedOutline);
          }
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
  }, [sessionId, navigate, hasStartedRefinement]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <NovelGenerationHeader />
        <NovelGenerationStatus 
          isLoading={isLoading}
          error={error}
          isRefining={isRefining}
        />
        {outline && !isLoading && !isRefining && (
          <NovelOutlineDisplay outline={outline} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default NovelGeneration;