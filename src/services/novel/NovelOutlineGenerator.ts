import { NovelParameters } from '@/types/novel';
import { ProcessedDimensions } from './ParameterProcessor';
import { VectorChunk } from '../story/types';
import { 
  generateChapterStructure,
  generateScenes,
  calculateWordCounts
} from './generators/OutlineGenerators';
import { 
  applyDimensionalGuidance,
  validateOutlineStructure 
} from './validators/OutlineValidators';
import { NovelChapter, NovelOutline } from './types';
import { supabase } from '@/integrations/supabase/client';

export class NovelOutlineGenerator {
  private parameters: NovelParameters;
  private dimensions: ProcessedDimensions;
  private vectorResults: VectorChunk[];
  private parameterWeights: Map<string, number> = new Map();
  private baseChapterCounts: Record<string, number> = {
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
    
    // Fetch and apply parameter weights
    await this.fetchParameterWeights();
    
    const chapterCount = this.calculateChapterCount();
    const chapters: NovelChapter[] = [];

    for (let i = 1; i <= chapterCount; i++) {
      console.log(`Generating chapter ${i} of ${chapterCount}`);
      chapters.push(await this.generateChapter(i, chapterCount));
    }

    const outline: NovelOutline = {
      chapters,
      metadata: {
        totalEstimatedWordCount: calculateWordCounts.totalWordCount(chapters),
        mainTheme: this.parameters.primaryTheme,
        subThemes: this.parameters.secondaryTheme ? [this.parameters.secondaryTheme] : [],
        creationTimestamp: new Date().toISOString()
      }
    };

    // Apply dimensional guidance with weighted parameters
    await this.applyWeightedGuidance(outline);

    // Validate structure
    await validateOutlineStructure(outline);

    console.log('Outline generation complete:', {
      chapterCount: outline.chapters.length,
      totalWordCount: outline.metadata.totalEstimatedWordCount
    });

    return outline;
  }

  private async fetchParameterWeights(): Promise<void> {
    try {
      const { data: parameterRefs, error } = await supabase
        .from('novel_parameter_references')
        .select('parameter_key, weight')
        .order('weight', { ascending: false });

      if (error) throw error;

      parameterRefs.forEach(ref => {
        this.parameterWeights.set(ref.parameter_key, ref.weight);
      });

      console.log('Fetched parameter weights:', 
        Object.fromEntries(this.parameterWeights.entries())
      );
    } catch (error) {
      console.error('Error fetching parameter weights:', error);
      // Use default weights if fetch fails
      this.initializeDefaultWeights();
    }
  }

  private initializeDefaultWeights(): void {
    const defaultWeights = {
      'complexity': 1.0,
      'conflict': 1.0,
      'emotionalDepth': 1.0,
      'detail': 1.0,
      'tone': 1.0,
      'structuralExpansion': 1.0,
      'pacing': 1.0,
      'thematicResonance': 1.0,
      'culturalCohesion': 1.0,
      'characterChemistry': 1.0,
      'genreAuthenticity': 1.0,
      'narrativeMomentum': 1.0,
      'worldIntegration': 1.0
    };

    Object.entries(defaultWeights).forEach(([key, weight]) => {
      this.parameterWeights.set(key, weight);
    });
  }

  private async applyWeightedGuidance(outline: NovelOutline): Promise<void> {
    // Apply weights to each dimension
    const weightedDimensions = Object.entries(this.dimensions).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value * (this.parameterWeights.get(key) || 1.0)
      }),
      {} as ProcessedDimensions
    );

    await applyDimensionalGuidance(outline, weightedDimensions);
  }

  private calculateChapterCount(): number {
    const baseCount = this.baseChapterCounts[this.parameters.novelLength];
    const expansionFactor = this.dimensions.structuralExpansion;
    const complexityFactor = Math.log1p(this.dimensions.complexity);
    
    const adjustedCount = Math.round(baseCount * expansionFactor * (1 + complexityFactor * 0.2));
    
    console.log('Calculated chapter count:', {
      baseCount,
      expansionFactor,
      complexityFactor,
      adjustedCount
    });
    
    return adjustedCount;
  }

  private async generateChapter(
    chapterNumber: number,
    totalChapters: number
  ): Promise<NovelChapter> {
    const plotPosition = chapterNumber / totalChapters;
    const wordCountGoal = calculateWordCounts.chapterWordCount(
      this.parameters,
      plotPosition,
      this.dimensions
    );
    
    const pacingGuidance = this.calculatePacing(plotPosition);
    
    const scenes = await generateScenes(
      chapterNumber,
      wordCountGoal,
      pacingGuidance,
      this.dimensions,
      this.parameters
    );

    return {
      chapterNumber,
      title: generateChapterStructure.generateTitle(
        chapterNumber,
        plotPosition,
        this.parameters,
        this.dimensions
      ),
      summary: generateChapterStructure.generateSummary(
        plotPosition,
        scenes,
        this.dimensions
      ),
      scenes,
      wordCountGoal,
      pacingGuidance,
      thematicElements: generateChapterStructure.selectThematicElements(
        plotPosition,
        this.parameters,
        this.dimensions
      ),
      plotProgression: plotPosition
    };
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
}
