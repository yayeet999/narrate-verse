import { createClient } from '@supabase/supabase-js';
import { StorySettings } from '@/types/story';
import { Database } from '@/integrations/supabase/types';
import { VectorSearchManager } from './VectorSearchManager';
import { StoryBibleGenerator } from './StoryBibleGenerator';
import { OutlineGenerator } from './OutlineGenerator';
import { ChapterGenerator } from './ChapterGenerator';
import { ParameterValidator } from './ParameterValidator';
import { supabase } from '@/integrations/supabase/client';

export class StoryGenerationService {
  private vectorSearchManager: VectorSearchManager;
  private parameterValidator: ParameterValidator;

  constructor() {
    this.vectorSearchManager = new VectorSearchManager();
    this.parameterValidator = new ParameterValidator();
  }

  async initializeGeneration(
    userId: string,
    settings: StorySettings
  ): Promise<{ sessionId: string }> {
    try {
      console.log('Initializing story generation for user:', userId);
      
      // Validate parameters
      const validationResult = await this.parameterValidator.validate(settings);
      if (!validationResult.success) {
        console.error('Parameter validation failed:', validationResult.error);
        throw new Error(`Parameter validation failed: ${validationResult.error}`);
      }

      // Create generation session
      const { data: session, error: sessionError } = await supabase
        .from('story_generation_sessions')
        .insert({
          user_id: userId,
          parameters: settings,
          status: 'in_progress',
          last_successful_chapter: 0
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation failed:', sessionError);
        throw new Error(`Session creation failed: ${sessionError.message}`);
      }

      console.log('Generation session created:', session.id);

      // Initialize background generation process
      this.startGenerationProcess(session.id, settings).catch(error => {
        console.error('Generation process failed:', error);
        this.updateSessionStatus(session.id, 'failed');
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Generation initialization failed:', error);
      throw new Error(`Generation initialization failed: ${error.message}`);
    }
  }

  private async startGenerationProcess(
    sessionId: string,
    settings: StorySettings
  ): Promise<void> {
    try {
      console.log('Starting generation process for session:', sessionId);
      
      // 1. Retrieve relevant reference material
      const vectorResults = await this.vectorSearchManager.executeSearch(settings);
      console.log('Vector search completed');

      // 2. Generate Story Bible
      const storyBibleGenerator = new StoryBibleGenerator(settings, vectorResults);
      const storyBible = await storyBibleGenerator.generateStoryBible();
      console.log('Story Bible generated');

      // Store Story Bible
      await this.storeGenerationData(sessionId, 'story_bible', storyBible);

      // 3. Generate Outline
      const outlineGenerator = new OutlineGenerator(storyBible, settings);
      let outline = await outlineGenerator.generateInitialOutline();
      console.log('Initial outline generated');
      
      outline = await outlineGenerator.refineOutline(outline, 'first');
      console.log('First outline refinement completed');
      
      outline = await outlineGenerator.refineOutline(outline, 'second');
      console.log('Second outline refinement completed');

      // Store Outline
      await this.storeGenerationData(sessionId, 'outline', outline);

      // 4. Generate Chapters
      const chapterGenerator = new ChapterGenerator(storyBible, settings, outline);
      const totalChapters = this.calculateTotalChapters(settings);
      console.log(`Starting chapter generation. Total chapters: ${totalChapters}`);

      for (let i = 0; i < totalChapters; i += 2) {
        console.log(`Generating chapters ${i + 1} and ${i + 2}`);
        const chapterPair = await chapterGenerator.generateChapterPair();
        
        // Store chapters
        await this.storeGenerationData(sessionId, 'chapter', chapterPair.firstChapter, i);
        if (chapterPair.secondChapter) {
          await this.storeGenerationData(sessionId, 'chapter', chapterPair.secondChapter, i + 1);
        }

        // Update progress
        await this.updateSessionProgress(sessionId, i + 2);
        console.log(`Chapters ${i + 1} and ${i + 2} completed`);
      }

      // Mark session as completed
      await this.updateSessionStatus(sessionId, 'completed');
      console.log('Generation process completed successfully');
    } catch (error) {
      console.error('Generation process failed:', error);
      await this.updateSessionStatus(sessionId, 'failed');
      throw error;
    }
  }

  private async storeGenerationData(
    sessionId: string,
    dataType: Database['public']['Enums']['generation_data_type'],
    content: any,
    sequenceNumber?: number
  ): Promise<void> {
    console.log(`Storing ${dataType} data for session:`, sessionId);
    
    const { error } = await supabase
      .from('story_generation_data')
      .insert({
        session_id: sessionId,
        data_type: dataType,
        content: JSON.stringify(content),
        sequence_number: sequenceNumber,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) {
      console.error('Failed to store generation data:', error);
      throw new Error(`Failed to store generation data: ${error.message}`);
    }
  }

  private async updateSessionStatus(
    sessionId: string,
    status: Database['public']['Enums']['story_generation_status']
  ): Promise<void> {
    console.log(`Updating session ${sessionId} status to:`, status);
    
    const { error } = await supabase
      .from('story_generation_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to update session status:', error);
      throw new Error(`Failed to update session status: ${error.message}`);
    }
  }

  private async updateSessionProgress(
    sessionId: string,
    lastSuccessfulChapter: number
  ): Promise<void> {
    console.log(`Updating session ${sessionId} progress:`, lastSuccessfulChapter);
    
    const { error } = await supabase
      .from('story_generation_sessions')
      .update({
        last_successful_chapter: lastSuccessfulChapter,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to update session progress:', error);
      throw new Error(`Failed to update session progress: ${error.message}`);
    }
  }

  private calculateTotalChapters(settings: StorySettings): number {
    const lengthMap = {
      '5-10': 4,
      '10-20': 8,
      '20-30': 12
    };
    return lengthMap[settings.basicSettings.length as keyof typeof lengthMap] || 8;
  }

  async getGenerationStatus(sessionId: string): Promise<{
    status: Database['public']['Enums']['story_generation_status'];
    progress: number;
  }> {
    console.log('Getting generation status for session:', sessionId);
    
    const { data, error } = await supabase
      .from('story_generation_sessions')
      .select('status, last_successful_chapter, parameters')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Failed to get generation status:', error);
      throw new Error(`Failed to get generation status: ${error.message}`);
    }

    const totalChapters = this.calculateTotalChapters(data.parameters as StorySettings);
    const progress = (data.last_successful_chapter || 0) / totalChapters * 100;

    return {
      status: data.status,
      progress: Math.min(progress, 100)
    };
  }

  async getGeneratedContent(sessionId: string): Promise<{
    storyBible: any;
    outline: any;
    chapters: any[];
  }> {
    console.log('Getting generated content for session:', sessionId);
    
    const { data, error } = await supabase
      .from('story_generation_data')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error('Failed to get generated content:', error);
      throw new Error(`Failed to get generated content: ${error.message}`);
    }

    const storyBible = data.find(d => d.data_type === 'story_bible')?.content;
    const outline = data.find(d => d.data_type === 'outline')?.content;
    const chapters = data
      .filter(d => d.data_type === 'chapter')
      .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0))
      .map(d => d.content);

    return {
      storyBible: storyBible ? JSON.parse(storyBible) : null,
      outline: outline ? JSON.parse(outline) : null,
      chapters: chapters.map(c => JSON.parse(c))
    };
  }
}