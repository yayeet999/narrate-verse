export interface NovelScene {
  id: string;
  sceneFocus: string;
  conflict: string;
  settingDetails: string;
  characterInvolvement: string[];
  wordCount: number;
  pacing: number;
  tone: number;
}

export interface WeightedTheme {
  theme: string;
  weight: number;
}

export interface NovelChapter {
  chapterNumber: number;
  chapterName: string;
  title: string;
  summary: string;
  scenes: NovelScene[];
  wordCountGoal: number;
  pacingGuidance: number;
  thematicElements: string[];
  weightedThemes?: WeightedTheme[];
  plotProgression: number;
  chapterSummary: string;
  keyPlotPoints: string[];
}

export interface TensionPoint {
  chapter: number;
  emotionalImpact: string;
  buildupNotes: string;
}

export interface NarrativeIntensification {
  tensionPoints: TensionPoint[];
  pacingAnalysis: string;
}

export interface CharacterDepthInfo {
  character: string;
  internalConflicts: string[];
  motivationLayers: string[];
}

export interface PsychologicalComplexity {
  characterDepth: CharacterDepthInfo[];
}

export interface NovelRefinements {
  narrativeIntensification: NarrativeIntensification;
  psychologicalComplexity: PsychologicalComplexity;
}

export interface WorldDetails {
  setting: string;
  worldComplexity: number;
  culturalDepth: number;
}

export interface NovelOutline {
  title: string;
  storyDescription: string;
  chapters: NovelChapter[];
  metadata: {
    totalEstimatedWordCount: number;
    mainTheme: string;
    subThemes: string[];
    creationTimestamp: string;
  };
  worldDetails: WorldDetails;
  themes: string[];
  characters: Array<{
    name: string;
    role: string;
    characterArc: string;
  }>;
  refinements?: NovelRefinements;
}