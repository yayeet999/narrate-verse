export type NovelLength = '50k-100k' | '100k-150k' | '150k+';
export type ChapterStructure = 'fixed' | 'variable';
export type ChapterNamingStyle = 'numbered' | 'titled' | 'both';

export type Genre = 
  | 'High Fantasy' | 'Urban Fantasy' | 'Dark Fantasy' | 'Epic Fantasy'
  | 'Space Opera' | 'Cyberpunk' | 'Post-Apocalyptic' | 'Hard Sci-Fi'
  | 'Detective' | 'Cozy Mystery' | 'Noir' | 'Thriller'
  | 'Contemporary Romance' | 'Historical Romance' | 'Paranormal Romance' | 'Romantic Comedy'
  | 'Contemporary Fiction' | 'Historical Fiction' | 'Experimental Fiction' | 'Satire';

export type Theme = 
  | 'Coming of Age' | 'Redemption' | 'Love and Loss' 
  | 'Power and Corruption' | 'Identity' | 'Good vs Evil';

export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting';
export type CharacterArchetype = 
  | 'The Hero' | 'The Mentor' | 'The Sidekick' 
  | 'The Love Interest' | 'The Villain' | 'The Anti-Hero' 
  | 'The Trickster' | 'The Sage';

export type ArcType = 
  | 'redemption' | 'fall' | 'coming_of_age' 
  | 'internal_discovery' | 'static';

export type Character = {
  name: string;
  role: CharacterRole;
  archetype: CharacterArchetype;
  ageRange: string;
  backgroundArchetype: string;
  arcType: ArcType;
  relationships: string[];
};

export type SettingType = 
  | 'Fantasy' | 'Urban' | 'Historical' | 'Futuristic' 
  | 'Contemporary' | 'Post-Apocalyptic' | 'Space' | 'Rural';

export type CulturalFramework = 
  | 'Western' | 'Eastern' | 'African' | 'Middle Eastern' 
  | 'Latin American' | 'Nordic' | 'Mediterranean' 
  | 'Indigenous' | 'Multicultural';

export type POV = 'first' | 'third_limited' | 'third_omniscient' | 'multiple';
export type StoryStructure = 
  | "Three-Act Structure" | "Hero's Journey" | "Nonlinear" 
  | "Parallel" | "Five-Act Structure" | "Episodic" 
  | "Circular" | "Framing Device" | "In Medias Res";

export type ConflictType = 
  | 'person_vs_person' | 'person_vs_nature' | 'person_vs_society' 
  | 'person_vs_self' | 'person_vs_technology' | 'person_vs_fate';

export type ResolutionStyle = 
  | 'Conclusive' | 'Open-Ended' | 'Twist' 
  | 'Circular' | 'Bittersweet';

export type SentenceStructure = 'varied' | 'consistent' | 'simple' | 'complex';
export type ParagraphLength = 'short' | 'medium' | 'long';
export type ControversialHandling = 'avoid' | 'careful' | 'direct';

export type NovelParameters = {
  title: string;
  novelLength: NovelLength;
  chapterStructure: ChapterStructure;
  averageChapterLength: number;
  chapterNamingStyle: ChapterNamingStyle;
  primaryGenre: Genre;
  secondaryGenre?: Genre;
  primaryTheme: Theme;
  secondaryTheme?: Theme;
  characters: Character[];
  settingType: SettingType;
  worldComplexity: number;
  culturalDepth: number;
  culturalFramework: CulturalFramework;
  pov: POV;
  storyStructure: StoryStructure;
  conflictTypes: ConflictType[];
  resolutionStyle: ResolutionStyle;
  toneFormality: number;
  toneDescriptive: number;
  dialogueBalance: number;
  descriptionDensity: number;
  pacingOverall: number;
  pacingVariance: number;
  emotionalIntensity: number;
  metaphorFrequency: number;
  flashbackUsage: number;
  foreshadowingIntensity: number;
  languageComplexity: number;
  sentenceStructure: SentenceStructure;
  paragraphLength: ParagraphLength;
  violenceLevel: number;
  adultContentLevel: number;
  profanityLevel: number;
  controversialHandling: ControversialHandling;
  storyDescription?: string;
};