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

// Add new types from the parameter validator
export interface Character {
  age: number;
  personalityTraits: string[];
  traits: {
    confidence: number;
    decisionMaking: number;
    predictability: number;
  };
}

export interface ThematicElements {
  coreThemes: string[];
  worldBuildingDepth: number;
  socialCulturalElements: number;
}

export interface PacingControls {
  plotDevelopment: number;
  sceneDetail: number;
  dialogNarrativeRatio: number;
}

export interface EmotionalTone {
  overallMood: number;
  dramaticHumorous: number;
}

export interface StoryParameters {
  storyLength: string;
  writingStyle: string;
  genre: string;
  worldType: string;
  pacing: PacingControls;
  emotionalTone: EmotionalTone;
  characters: Character[];
  thematicElements: ThematicElements;
}