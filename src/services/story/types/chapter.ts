import { OutlineSection } from './outline';

export interface ChapterSummary {
  chapterNumber: number;
  keyEvents: string[];
  characterDevelopments: Map<string, string>;
  plotProgress: string;
  thematicDevelopments: string[];
}

export interface ChapterPair {
  firstChapter: {
    content: string;
    summary: ChapterSummary;
  };
  secondChapter: {
    content: string;
    summary: ChapterSummary;
  } | null;
}

export interface ChapterPrompt {
  context: {
    storyContext: {
      genre: string;
      worldType: string;
      mood: number;
    };
    previousEvents: string[];
    characterStates: Map<string, string>;
    plotProgress: string;
    thematicProgress: string[];
  };
  requirements: {
    scenes: any[];
    characters: string[];
    plot: string[];
    pacing: number;
  };
  style: {
    tone: number;
    writingStyle: string;
    dialogueStyle: string;
    descriptionStyle: string;
  };
  technical: {
    wordCountTarget: number;
    pacing: number;
    dialogueRatio: number;
    sceneTransitions: string[];
  };
  outline: OutlineSection;
}