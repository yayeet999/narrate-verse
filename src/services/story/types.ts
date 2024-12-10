import { StorySettings } from '@/types/story';

export interface VectorChunk {
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

export type BasicSettings = {
  genre: string;
  length: string;
  writingStyle: string;
};

export type WorldBuilding = {
  worldType: string;
  timePeriod: string;
  worldView: string[];
  settingDetail: number;
  socialCulturalElements: number;
};

export type PacingStyle = {
  plotDevelopment: number;
  sceneDetail: number;
  dialogNarrative: number;
  overallMood: number;
  dramaticHumorous: number;
};

export type CharacterCreation = {
  ageRange: string;
  characterRole: string;
  personalityTraits: string[];
  coreDrive: string;
  moralAlignment: string;
  confidence: number;
  decisionMaking: number;
  predictability: number;
};

export type ThematicElements = {
  coreThemes: string[];
  storyEnding: string;
  moodAndFeel: string[];
};

export type StorySettings = {
  basicSettings: BasicSettings;
  worldBuilding: WorldBuilding;
  pacingStyle: PacingStyle;
  characterCreation: CharacterCreation;
  thematicElements: ThematicElements;
  customInstructions: string;
};
