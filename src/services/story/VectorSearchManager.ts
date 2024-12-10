import { ProcessedVectorResults, VectorChunk, StorySettings } from './types';
import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

export class VectorSearchManager {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  }

  async executeSearch(settings: StorySettings): Promise<ProcessedVectorResults> {
    try {
      const settingsString = JSON.stringify(settings);
      const embedding = await this.generateEmbedding(settingsString);
      
      const { data: chunks, error } = await supabase
        .rpc('match_story_chunks', {
          query_embedding: JSON.stringify(embedding),
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

  async searchWithEmbedding(
    embedding: number[], 
    threshold: number = 0.5, 
    limit: number = 5
  ): Promise<VectorChunk[]> {
    const { data: chunks, error } = await supabase.rpc('match_story_chunks', {
      query_embedding: JSON.stringify(embedding),
      match_threshold: threshold,
      match_count: limit
    });

    if (error) throw error;

    return this.processChunks(chunks);
  }

  private processChunks(chunks: any[]): VectorChunk[] {
    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      category: chunk.category || 'uncategorized',
      relevanceScore: chunk.similarity || 0,
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