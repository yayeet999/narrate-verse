import { supabase } from '@/integrations/supabase/client';

interface MatchedParameter {
  id: string;
  category: string;
  parameter_key: string;
  description: string;
  weight: number;
  similarity: number;
}

interface MatchedChunk {
  id: string;
  content: string;
  similarity: number;
}

export async function searchNovelParameters(
  queryEmbedding: string,
  matchThreshold = 0.7,
  matchCount = 10
): Promise<MatchedParameter[]> {
  console.log('Searching novel parameters with threshold:', matchThreshold);
  
  const { data, error } = await supabase.rpc('match_novel_parameters', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount
  });

  if (error) {
    console.error('Error searching novel parameters:', error);
    throw error;
  }

  console.log(`Found ${data.length} matching parameters`);
  return data;
}

export async function searchStoryChunks(
  queryEmbedding: string,
  matchThreshold = 0.7,
  matchCount = 10
): Promise<MatchedChunk[]> {
  console.log('Searching story chunks with threshold:', matchThreshold);

  const { data, error } = await supabase.rpc('match_story_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount
  });

  if (error) {
    console.error('Error searching story chunks:', error);
    throw error;
  }

  console.log(`Found ${data.length} matching chunks`);
  return data;
}

// Helper function to generate embeddings using the edge function
export async function generateEmbedding(text: string): Promise<string> {
  const response = await fetch('/api/generate-embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const { embedding } = await response.json();
  return `[${embedding.join(',')}]`; // Format for Postgres vector type
}