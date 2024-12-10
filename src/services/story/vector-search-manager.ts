import { createClient } from '@supabase/supabase-js';
import { StorySettings } from '@/types/story';
import { Database } from '@/integrations/supabase/types';
import { ProcessedVectorResults, VectorChunk } from './types';
import { supabase } from '@/integrations/supabase/client';

export class VectorSearchManager {
  private readonly MATCH_THRESHOLD = 0.7;
  private readonly MAX_CHUNKS_PER_CATEGORY = 5;

  async executeSearch(settings: StorySettings): Promise<ProcessedVectorResults> {
    try {
      console.log('Starting vector search with settings:', settings);
      
      const searchPromises = [
        this.searchWritingStyle(settings),
        this.searchGenreGuides(settings),
        this.searchCharacterGuides(settings),
        this.searchPlotStructures(settings)
      ];

      const [writingGuides, genreGuides, characterGuides, plotStructures] = 
        await Promise.all(searchPromises);

      const results = {
        writingGuides,
        genreGuides,
        characterGuides,
        plotStructures,
        technicalSpecs: await this.getTechnicalSpecifications(settings)
      };

      console.log('Vector search completed successfully:', results);
      return results;
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }
  }

  private async generateEmbedding(text: string): Promise<string> {
    console.log('Generating embedding for text:', text);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small"
      })
    });

    if (!response.ok) {
      console.error('Embedding generation failed:', await response.text());
      throw new Error('Failed to generate embedding');
    }

    const result = await response.json();
    // Convert the embedding array to a vector string format that Postgres expects
    return `[${result.data[0].embedding.join(',')}]`;
  }

  private async searchWithEmbedding(
    embedding: string,
    category: string
  ): Promise<VectorChunk[]> {
    console.log(`Searching for ${category} with embedding`);
    
    const { data, error } = await supabase.rpc('match_story_chunks', {
      query_embedding: embedding,
      match_threshold: this.MATCH_THRESHOLD,
      match_count: this.MAX_CHUNKS_PER_CATEGORY
    });

    if (error) {
      console.error(`Vector search failed for ${category}:`, error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    return data.map(chunk => ({
      content: chunk.content,
      category: chunk.category,
      relevanceScore: chunk.similarity,
      metadata: chunk.metadata || {}
    }));
  }

  private async searchWritingStyle(settings: StorySettings): Promise<VectorChunk[]> {
    const query = `Writing style: ${settings.basicSettings.writingStyle}
                  Pacing: ${settings.pacingStyle.plotDevelopment}/5
                  Dialog ratio: ${settings.pacingStyle.dialogNarrative}/5`;
    
    const embedding = await this.generateEmbedding(query);
    return this.searchWithEmbedding(embedding, 'writing_style');
  }

  private async searchGenreGuides(settings: StorySettings): Promise<VectorChunk[]> {
    const query = `Genre: ${settings.basicSettings.genre}
                  World type: ${settings.worldBuilding.worldType}
                  Setting detail: ${settings.worldBuilding.settingDetail}/5`;
    
    const embedding = await this.generateEmbedding(query);
    return this.searchWithEmbedding(embedding, 'genre_guide');
  }

  private async searchCharacterGuides(settings: StorySettings): Promise<VectorChunk[]> {
    const query = `Character role: ${settings.characterCreation.characterRole}
                  Personality traits: ${settings.characterCreation.personalityTraits.join(', ')}
                  Moral alignment: ${settings.characterCreation.moralAlignment}`;
    
    const embedding = await this.generateEmbedding(query);
    return this.searchWithEmbedding(embedding, 'character_guide');
  }

  private async searchPlotStructures(settings: StorySettings): Promise<VectorChunk[]> {
    const query = `Story length: ${settings.basicSettings.length}
                  Plot development: ${settings.pacingStyle.plotDevelopment}/5
                  Core themes: ${settings.thematicElements.coreThemes.join(', ')}`;
    
    const embedding = await this.generateEmbedding(query);
    return this.searchWithEmbedding(embedding, 'plot_structure');
  }

  private async getTechnicalSpecifications(settings: StorySettings): Promise<VectorChunk[]> {
    const query = `Story length: ${settings.basicSettings.length}
                  Writing style: ${settings.basicSettings.writingStyle}`;
    
    const embedding = await this.generateEmbedding(query);
    return this.searchWithEmbedding(embedding, 'technical_spec');
  }
}