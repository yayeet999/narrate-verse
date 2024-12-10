import type { StorySettings as ImportedStorySettings } from '@/types/story';

// Re-export StorySettings to avoid naming conflict
export type StorySettings = ImportedStorySettings;

export interface VectorChunk {
  id: string;
  content: string;
  category: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

export interface ProcessedVectorResults {
  writingGuides: VectorChunk[];
  genreGuides: VectorChunk[];
  characterGuides: VectorChunk[];
  plotStructures: VectorChunk[];
  technicalSpecs: VectorChunk[];
}

export interface ValidationResult {
  success: boolean;
  error?: string;
}