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