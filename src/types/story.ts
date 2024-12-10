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