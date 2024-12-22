import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { searchNovelParameters, generateEmbedding } from '@/utils/vectorSearch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function VectorSearchExample() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const embedding = await generateEmbedding(searchText);
      const matches = await searchNovelParameters(embedding);
      setResults(matches);
      toast.success(`Found ${matches.length} matching parameters`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to perform vector search');
    } finally {
      setIsSearching(false);
    }
  };

  const generateParameterEmbeddings = async () => {
    try {
      setIsGenerating(true);
      const { error } = await supabase.functions.invoke('generate-parameter-embeddings');
      
      if (error) throw error;
      
      toast.success('Started generating embeddings for parameters');
      console.log('Parameter embeddings generation initiated');
    } catch (error) {
      console.error('Failed to generate parameter embeddings:', error);
      toast.error('Failed to generate parameter embeddings');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter search text..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <Button 
        onClick={generateParameterEmbeddings} 
        disabled={isGenerating}
        variant="outline"
        className="w-full"
      >
        {isGenerating ? 'Generating Embeddings...' : 'Generate Parameter Embeddings'}
      </Button>

      <div className="space-y-2">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <p className="font-medium">{result.parameter_key}</p>
            <p className="text-sm text-muted-foreground">{result.description}</p>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Category: </span>
              {result.category}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Weight: </span>
              {result.weight}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Similarity: </span>
              {(result.similarity * 100).toFixed(2)}%
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}