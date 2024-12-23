import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NovelGenerationHeader() {
  const navigate = useNavigate();
  
  return (
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
        Review your generated outline
      </p>
    </div>
  );
}