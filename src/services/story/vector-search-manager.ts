import { VectorChunk } from './types';
import { supabase } from '@/integrations/supabase/client';

export class VectorSearchManager {
  async searchWithEmbedding(
    embedding: number[], 
    threshold: number = 0.5, 
    limit: number = 5
  ): Promise<VectorChunk[]> {
    const { data: chunks, error } = await supabase.rpc('match_story_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) throw error;

    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      category: chunk.category || '',
      relevanceScore: chunk.similarity,
      metadata: chunk.metadata || {}
    }));
  }
}