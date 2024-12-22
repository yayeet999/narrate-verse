import { NovelParameters } from '@/types/novel';
import { ProcessedDimensions } from './ParameterProcessor';
import { VectorChunk } from '../story/types';

interface NovelScene {
  id: string;
  sceneFocus: string;
  conflict: string;
  settingDetails: string;
  characterInvolvement: string[];
  wordCount: number;
  pacing: number;
  tone: number;
}

interface NovelChapter {
  chapterNumber: number;
  title: string;
  summary: string;
  scenes: NovelScene[];
  wordCountGoal: number;
  pacingGuidance: number;
  thematicElements: string[];
  plotProgression: number;
}

interface NovelOutline {
  chapters: NovelChapter[];
  metadata: {
    totalEstimatedWordCount: number;
    mainTheme: string;
    subThemes: string[];
    creationTimestamp: string;
  };
}

export class NovelOutlineGenerator {
  private parameters: NovelParameters;
  private dimensions: ProcessedDimensions;
  private vectorResults: VectorChunk[];
  private baseChapterCounts: Record<NovelLength, number> = {
    '50k-100k': 15,
    '100k-150k': 25,
    '150k+': 35
  };

  constructor(
    parameters: NovelParameters,
    dimensions: ProcessedDimensions,
    vectorResults: VectorChunk[]
  ) {
    this.parameters = parameters;
    this.dimensions = dimensions;
    this.vectorResults = vectorResults;
    console.log('Initializing NovelOutlineGenerator with:', {
      novelLength: parameters.novelLength,
      dimensions: Object.keys(dimensions),
      vectorResultsCount: vectorResults.length
    });
  }

  async generateOutline(): Promise<NovelOutline> {
    console.log('Starting outline generation process');
    
    const chapterCount = this.calculateChapterCount();
    const chapters: NovelChapter[] = [];

    for (let i = 1; i <= chapterCount; i++) {
      console.log(`Generating chapter ${i} of ${chapterCount}`);
      chapters.push(await this.generateChapter(i, chapterCount));
    }

    const outline: NovelOutline = {
      chapters,
      metadata: {
        totalEstimatedWordCount: this.calculateTotalWordCount(chapters),
        mainTheme: this.parameters.primaryTheme,
        subThemes: this.parameters.secondaryTheme ? [this.parameters.secondaryTheme] : [],
        creationTimestamp: new Date().toISOString()
      }
    };

    console.log('Outline generation complete:', {
      chapterCount: outline.chapters.length,
      totalWordCount: outline.metadata.totalEstimatedWordCount
    });

    return outline;
  }

  private calculateChapterCount(): number {
    const baseCount = this.baseChapterCounts[this.parameters.novelLength];
    const expansionFactor = this.dimensions.structuralExpansion;
    const adjustedCount = Math.round(baseCount * expansionFactor);
    
    console.log('Calculated chapter count:', {
      baseCount,
      expansionFactor,
      adjustedCount
    });
    
    return adjustedCount;
  }

  private async generateChapter(
    chapterNumber: number,
    totalChapters: number
  ): Promise<NovelChapter> {
    const plotPosition = chapterNumber / totalChapters;
    const wordCountGoal = this.calculateChapterWordCount(plotPosition);
    const pacingGuidance = this.calculatePacing(plotPosition);
    
    const scenes = await this.generateScenes(
      chapterNumber,
      wordCountGoal,
      pacingGuidance
    );

    return {
      chapterNumber,
      title: `Chapter ${chapterNumber}`, // Will be enhanced with vector results
      summary: this.generateChapterSummary(plotPosition, scenes),
      scenes,
      wordCountGoal,
      pacingGuidance,
      thematicElements: this.selectThematicElements(plotPosition),
      plotProgression: plotPosition
    };
  }

  private calculateChapterWordCount(plotPosition: number): number {
    const averageChapterLength = this.parameters.averageChapterLength;
    const varianceFactor = 0.2; // 20% variance
    const positionAdjustment = Math.sin(plotPosition * Math.PI) * varianceFactor;
    
    return Math.round(averageChapterLength * (1 + positionAdjustment));
  }

  private calculatePacing(plotPosition: number): number {
    const basePacing = this.dimensions.pacing;
    const plotIntensity = this.getPlotIntensity(plotPosition);
    return Math.min(5, basePacing * plotIntensity);
  }

  private getPlotIntensity(plotPosition: number): number {
    if (plotPosition < 0.25) return 0.8; // Setup
    if (plotPosition < 0.75) return 1.0; // Rising action
    if (plotPosition < 0.9) return 1.3;  // Climax
    return 0.7; // Resolution
  }

  private async generateScenes(
    chapterNumber: number,
    wordCountGoal: number,
    pacingGuidance: number
  ): Promise<NovelScene[]> {
    const sceneCount = this.calculateSceneCount(pacingGuidance);
    const scenes: NovelScene[] = [];

    for (let i = 0; i < sceneCount; i++) {
      scenes.push({
        id: `ch${chapterNumber}_scene${i + 1}`,
        sceneFocus: this.generateSceneFocus(i, sceneCount),
        conflict: this.generateConflict(),
        settingDetails: this.generateSettingDetails(),
        characterInvolvement: this.selectCharacters(),
        wordCount: Math.round(wordCountGoal / sceneCount),
        pacing: pacingGuidance,
        tone: this.dimensions.tone
      });
    }

    return scenes;
  }

  private calculateSceneCount(pacing: number): number {
    return Math.max(2, Math.round(3 + (pacing - 3) * 0.5));
  }

  private generateSceneFocus(sceneIndex: number, totalScenes: number): string {
    return `Scene focus ${sceneIndex + 1}/${totalScenes}`;
  }

  private generateConflict(): string {
    return "Conflict description";
  }

  private generateSettingDetails(): string {
    return "Setting details";
  }

  private selectCharacters(): string[] {
    return this.parameters.characters
      .slice(0, 3)
      .map(char => char.name);
  }

  private generateChapterSummary(plotPosition: number, scenes: NovelScene[]): string {
    return `Chapter summary at ${Math.round(plotPosition * 100)}% of the story`;
  }

  private selectThematicElements(plotPosition: number): string[] {
    return [this.parameters.primaryTheme];
  }

  private calculateTotalWordCount(chapters: NovelChapter[]): number {
    return chapters.reduce((total, chapter) => total + chapter.wordCountGoal, 0);
  }
}