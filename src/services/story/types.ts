import type { StorySettings as ImportedStorySettings } from '@/types/story';

// Re-export StorySettings to avoid naming conflict
export type StorySettings = ImportedStorySettings;

export interface StoryBible {
  characters: {
    mainCharacter: {
      profile: {
        role: string;
      };
      arc: {
        startingPoint: string;
        majorChanges: string[];
        endPoint: string;
      };
    };
    supportingCharacters: Array<{
      role: string;
      arc: string;
    }>;
  };
  plot: {
    structure: {
      mainPlot: {
        hook: string;
        incitingIncident: string;
        risingAction: string[];
        climax: string;
        resolution: string;
      };
    };
    themes: {
      primary: string;
      secondary: string[];
      symbolism: string[];
      motifs: string[];
    };
  };
}

export interface ValidationResult {
  success: boolean;
  error?: string;
}

export interface OutlineSection {
  chapterNumber: number;
  title: string;
  scenes: SceneOutline[];
  purpose: string;
  characters: string[];
  objectives: string[];
  technicalNotes: {
    targetWordCount: number;
    paceTarget: number;
    emotionalArc: string;
    requiredElements: string[];
  };
}

export interface SceneOutline {
  id: string;
  summary: string;
  characters: string[];
  location: string;
  conflict: string;
  objectives: string[];
  technicalNotes: {
    pacing: string;
    tone: string;
    style: string;
    wordCountTarget: number;
  };
}

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