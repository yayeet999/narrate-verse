import { ProcessedVectorResults, VectorChunk } from './types';
import { supabase } from '@/integrations/supabase/client';

export class VectorSearchManager {
  async executeSearch(settings: any): Promise<ProcessedVectorResults> {
    try {
      const { data: chunks, error } = await supabase
        .rpc('match_story_chunks', {
          query_embedding: [], // This should be your actual embedding
          match_threshold: 0.7,
          match_count: 10
        });

      if (error) throw error;

      const processedChunks = this.processChunks(chunks);
      return this.categorizeChunks(processedChunks);
    } catch (error) {
      console.error('Error executing vector search:', error);
      throw error;
    }
  }

  private processChunks(chunks: any[]): VectorChunk[] {
    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      category: chunk.category || 'uncategorized',
      relevanceScore: chunk.similarity,
      metadata: chunk.metadata || {}
    }));
  }

  private categorizeChunks(chunks: VectorChunk[]): ProcessedVectorResults {
    return {
      writingGuides: chunks.filter(c => c.category === 'writing_guide'),
      genreGuides: chunks.filter(c => c.category === 'genre_guide'),
      characterGuides: chunks.filter(c => c.category === 'character_guide'),
      plotStructures: chunks.filter(c => c.category === 'plot_structure'),
      technicalSpecs: chunks.filter(c => c.category === 'technical_spec')
    };
  }
}