import { NovelParameters } from '@/types/novel';
import { supabase } from '@/integrations/supabase/client';

export interface ProcessedDimensions {
  complexity: number;
  conflict: number;
  emotionalDepth: number;
  detail: number;
  tone: number;
  structuralExpansion: number;
  pacing: number;
  thematicResonance: number;
  culturalCohesion: number;
  characterChemistry: number;
  genreAuthenticity: number;
  narrativeMomentum: number;
  worldIntegration: number;
}

export class ParameterProcessor {
  private parameters: NovelParameters;
  private vectorResults: any;

  constructor(parameters: NovelParameters) {
    this.parameters = parameters;
    console.log('Initializing ParameterProcessor with parameters:', parameters);
  }

  async process(): Promise<ProcessedDimensions> {
    console.log('Starting parameter processing');
    
    await this.embedAndStoreParameters();
    const dimensions = await this.calculateDimensions();
    
    console.log('Final processed dimensions:', dimensions);
    return dimensions;
  }

  private async embedAndStoreParameters(): Promise<void> {
    console.log('Starting parameter embedding');
    
    try {
      const { data: chunks, error } = await supabase.rpc('match_story_chunks', {
        query_embedding: await this.generateParameterEmbedding(),
        match_threshold: 0.7,
        match_count: 10
      });

      if (error) throw error;
      
      this.vectorResults = this.processVectorResults(chunks);
      console.log('Parameter embedding complete, vector results:', this.vectorResults);
    } catch (error) {
      console.error('Error in parameter embedding:', error);
      throw error;
    }
  }

  private async generateParameterEmbedding(): Promise<string> {
    const paramString = this.parametersToString();
    
    const response = await fetch('/api/generate-embedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: paramString })
    });

    const { embedding } = await response.json();
    // Convert the embedding array to a string representation that Postgres vector type expects
    return `[${embedding.join(',')}]`;
  }

  private parametersToString(): string {
    return `
      Genre: ${this.parameters.primaryGenre}
      Theme: ${this.parameters.primaryTheme}
      Setting: ${this.parameters.settingType}
      Length: ${this.parameters.novelLength}
      POV: ${this.parameters.pov}
      Structure: ${this.parameters.storyStructure}
    `;
  }

  private processVectorResults(chunks: any[]): any {
    // Process and categorize the vector search results
    return chunks.reduce((acc, chunk) => {
      const category = chunk.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(chunk);
      return acc;
    }, {});
  }

  private async calculateDimensions(): Promise<ProcessedDimensions> {
    console.log('Starting dimension calculation');
    
    // Initialize base dimensions
    let dimensions: ProcessedDimensions = {
      complexity: this.calculateComplexity(),
      conflict: this.calculateConflict(),
      emotionalDepth: this.calculateEmotionalDepth(),
      detail: this.calculateDetail(),
      tone: this.calculateTone(),
      structuralExpansion: this.calculateStructuralExpansion(),
      pacing: this.calculatePacing(),
      thematicResonance: this.calculateThematicResonance(),
      culturalCohesion: this.calculateCulturalCohesion(),
      characterChemistry: this.calculateCharacterChemistry(),
      genreAuthenticity: this.calculateGenreAuthenticity(),
      narrativeMomentum: this.calculateNarrativeMomentum(),
      worldIntegration: this.calculateWorldIntegration()
    };

    // Apply multi-stage normalization
    dimensions = this.normalizeLocally(dimensions);
    dimensions = this.normalizeGlobally(dimensions);
    
    // Apply genre-specific adjustments
    dimensions = this.applyGenreAdjustments(dimensions);
    
    // Resolve conflicts
    dimensions = this.resolveConflicts(dimensions);

    console.log('Dimension calculation complete:', dimensions);
    return dimensions;
  }

  private calculateComplexity(): number {
    const base = 1.0;
    const worldFactor = this.parameters.worldComplexity * 0.2;
    const culturalFactor = this.parameters.culturalDepth * 0.15;
    return Math.min(base + worldFactor + culturalFactor, 2.5);
  }

  private calculateConflict(): number {
    const base = 1.0;
    const violenceFactor = this.parameters.violenceLevel * 0.3;
    const conflictTypes = this.parameters.conflictTypes.length * 0.2;
    return Math.min(base + violenceFactor + conflictTypes, 2.5);
  }

  private calculateEmotionalDepth(): number {
    return this.parameters.emotionalIntensity * 0.5;
  }

  private calculateDetail(): number {
    return (this.parameters.toneDescriptive + this.parameters.descriptionDensity) * 0.3;
  }

  private calculateTone(): number {
    const base = 3; // Middle of the scale
    return base - (this.parameters.toneFormality - 3) * 0.5;
  }

  private calculateStructuralExpansion(): number {
    const lengthFactors = {
      '50k-100k': 1.0,
      '100k-150k': 1.5,
      '150k+': 2.0
    };
    return lengthFactors[this.parameters.novelLength] || 1.0;
  }

  private calculatePacing(): number {
    return (this.parameters.pacingOverall + this.parameters.pacingVariance) * 0.3;
  }

  private calculateThematicResonance(): number {
    // Base resonance from primary theme
    const base = 1.0;
    // Add bonus for matching genre conventions
    const genreThemeMatch = this.checkGenreThemeMatch() ? 0.5 : 0;
    return base + genreThemeMatch;
  }

  private calculateCulturalCohesion(): number {
    return this.parameters.culturalDepth * 0.4;
  }

  private calculateCharacterChemistry(): number {
    return this.parameters.characters.length * 0.3;
  }

  private calculateGenreAuthenticity(): number {
    // Base authenticity
    const base = 1.0;
    // Add bonus for genre-appropriate elements
    const genreBonus = this.checkGenreRequirements() ? 0.5 : 0;
    return base + genreBonus;
  }

  private calculateNarrativeMomentum(): number {
    return (this.parameters.pacingOverall + this.parameters.emotionalIntensity) * 0.25;
  }

  private calculateWorldIntegration(): number {
    return (this.parameters.worldComplexity + this.parameters.culturalDepth) * 0.3;
  }

  private normalizeLocally(dimensions: ProcessedDimensions): ProcessedDimensions {
    // Cap each dimension at 2.5
    return Object.entries(dimensions).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Math.min(value, 2.5)
    }), {} as ProcessedDimensions);
  }

  private normalizeGlobally(dimensions: ProcessedDimensions): ProcessedDimensions {
    const sum = Object.values(dimensions).reduce((a, b) => a + b, 0);
    const maxSum = 25; // Maximum allowed sum of all dimensions
    
    if (sum > maxSum) {
      const factor = maxSum / sum;
      return Object.entries(dimensions).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value * factor
      }), {} as ProcessedDimensions);
    }
    
    return dimensions;
  }

  private applyGenreAdjustments(dimensions: ProcessedDimensions): ProcessedDimensions {
    const genre = this.parameters.primaryGenre;
    
    switch (genre) {
      case 'High Fantasy':
      case 'Epic Fantasy':
        dimensions.complexity *= 1.2;
        dimensions.worldIntegration *= 1.3;
        break;
      case 'Hard Sci-Fi':
        dimensions.complexity *= 1.4;
        dimensions.detail *= 1.3;
        break;
      case 'Detective':
      case 'Noir':
        dimensions.narrativeMomentum *= 1.2;
        dimensions.conflict *= 1.1;
        break;
      // Add more genre-specific adjustments as needed
    }
    
    return dimensions;
  }

  private resolveConflicts(dimensions: ProcessedDimensions): ProcessedDimensions {
    // Example conflict resolution: can't have very high pacing with very high detail
    if (dimensions.pacing > 2.0 && dimensions.detail > 2.0) {
      dimensions.detail = Math.min(dimensions.detail, 2.0);
    }
    
    return dimensions;
  }

  private checkGenreThemeMatch(): boolean {
    // Check if the theme matches common genre conventions
    const genreThemes = {
      'High Fantasy': ['Good vs Evil', 'Power and Corruption'],
      'Detective': ['Identity', 'Redemption'],
      // Add more genre-theme mappings
    };
    
    return genreThemes[this.parameters.primaryGenre]?.includes(this.parameters.primaryTheme) || false;
  }

  private checkGenreRequirements(): boolean {
    // Check if the story meets genre-specific requirements
    const genre = this.parameters.primaryGenre;
    
    switch (genre) {
      case 'Hard Sci-Fi':
        return this.parameters.worldComplexity >= 4;
      case 'Epic Fantasy':
        return this.parameters.worldComplexity >= 3 && this.parameters.culturalDepth >= 3;
      default:
        return true;
    }
  }
}
