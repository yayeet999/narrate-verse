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
  title: string;
  summary: string;
  scenes: NovelScene[];
  wordCountGoal: number;
  pacingGuidance: number;
  thematicElements: string[];
  weightedThemes?: WeightedTheme[];  // Add this optional field for internal use
  plotProgression: number;
}

export interface NovelOutline {
  chapters: NovelChapter[];
  metadata: {
    totalEstimatedWordCount: number;
    mainTheme: string;
    subThemes: string[];
    creationTimestamp: string;
  };
}