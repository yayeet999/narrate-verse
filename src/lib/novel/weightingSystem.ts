import { NovelParameters } from '@/types/novel';

export interface StoryDimensions {
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

export function calculateDimensions(parameters: NovelParameters): StoryDimensions {
  // Base calculations
  const dimensions: StoryDimensions = {
    complexity: calculateComplexity(parameters),
    conflict: calculateConflict(parameters),
    emotionalDepth: parameters.emotionalIntensity * 0.5,
    detail: (parameters.toneDescriptive + parameters.descriptionDensity) * 0.3,
    tone: 1.5 + (parameters.toneFormality - 3) * 0.2,
    structuralExpansion: calculateStructuralExpansion(parameters),
    pacing: (parameters.pacingOverall + parameters.pacingVariance) * 0.3,
    thematicResonance: calculateThematicResonance(parameters),
    culturalCohesion: parameters.culturalDepth * 0.4,
    characterChemistry: parameters.characters.length * 0.3,
    genreAuthenticity: calculateGenreAuthenticity(parameters),
    narrativeMomentum: (parameters.pacingOverall + parameters.emotionalIntensity) * 0.25,
    worldIntegration: (parameters.worldComplexity + parameters.culturalDepth) * 0.3
  };

  return normalizeAndAdjustDimensions(dimensions, parameters);
}

function calculateComplexity(parameters: NovelParameters): number {
  const base = 1.0;
  const worldFactor = parameters.worldComplexity * 0.2;
  const culturalFactor = parameters.culturalDepth * 0.15;
  const genreBonus = parameters.primaryGenre === 'Hard Sci-Fi' ? 0.3 : 0;
  return base + worldFactor + culturalFactor + genreBonus;
}

function calculateConflict(parameters: NovelParameters): number {
  const base = 1.0;
  const violenceFactor = parameters.violenceLevel * 0.3;
  const conflictTypes = parameters.conflictTypes.length * 0.2;
  return base + violenceFactor + conflictTypes;
}

function calculateStructuralExpansion(parameters: NovelParameters): number {
  const lengthFactors: Record<string, number> = {
    '50k-100k': 1.0,
    '100k-150k': 1.5,
    '150k+': 2.0
  };
  return lengthFactors[parameters.novelLength] || 1.0;
}

function calculateThematicResonance(parameters: NovelParameters): number {
  const base = 1.0;
  const themeMatches = checkThemeGenreMatch(parameters) ? 0.5 : 0;
  return base + themeMatches;
}

function calculateGenreAuthenticity(parameters: NovelParameters): number {
  const base = 1.0;
  const genreBonus = checkGenreRequirements(parameters) ? 0.5 : 0;
  return base + genreBonus;
}

function checkThemeGenreMatch(parameters: NovelParameters): boolean {
  const genreThemes: Record<string, string[]> = {
    'High Fantasy': ['Good vs Evil', 'Power and Corruption'],
    'Detective': ['Identity', 'Redemption']
    // Add more genre-theme mappings as needed
  };
  return genreThemes[parameters.primaryGenre]?.includes(parameters.primaryTheme) || false;
}

function checkGenreRequirements(parameters: NovelParameters): boolean {
  switch (parameters.primaryGenre) {
    case 'Hard Sci-Fi':
      return parameters.worldComplexity >= 4;
    case 'Epic Fantasy':
      return parameters.worldComplexity >= 3 && parameters.culturalDepth >= 3;
    default:
      return true;
  }
}

function normalizeAndAdjustDimensions(dimensions: StoryDimensions, parameters: NovelParameters): StoryDimensions {
  // Cap each dimension at 2.5
  Object.keys(dimensions).forEach(key => {
    dimensions[key as keyof StoryDimensions] = Math.min(
      dimensions[key as keyof StoryDimensions],
      2.5
    );
  });

  // Apply genre-specific adjustments
  switch (parameters.primaryGenre) {
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
  }

  // Final normalization pass
  Object.keys(dimensions).forEach(key => {
    dimensions[key as keyof StoryDimensions] = Math.min(
      dimensions[key as keyof StoryDimensions],
      2.5
    );
  });

  return dimensions;
}