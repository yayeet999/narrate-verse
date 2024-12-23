import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface NovelGenerationStatusProps {
  isLoading: boolean;
  error: string | null;
  isRefining: boolean;
}

export function NovelGenerationStatus({ isLoading, error, isRefining }: NovelGenerationStatusProps) {
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </Card>
    );
  }

  if (isLoading || isRefining) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            {isRefining ? 'Refining your novel outline...' : 'Generating your novel outline...'}
          </p>
          <p className="text-sm text-muted-foreground">This may take a few minutes.</p>
        </div>
      </Card>
    );
  }

  return null;
}