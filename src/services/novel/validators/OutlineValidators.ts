import { ProcessedDimensions } from '../ParameterProcessor';
import { NovelOutline } from '../types';

export const applyDimensionalGuidance = async (
  outline: NovelOutline,
  dimensions: ProcessedDimensions
): Promise<void> => {
  console.log('Applying dimensional guidance with weights:', dimensions);

  // Apply weighted dimensions to chapter generation
  outline.chapters = outline.chapters.map(chapter => {
    const plotPosition = chapter.plotProgression;
    
    // Adjust pacing based on weighted dimensions
    chapter.pacingGuidance = Math.min(5, 
      chapter.pacingGuidance * (dimensions.pacing / 2.5)
    );

    // Adjust thematic elements based on weighted dimensions
    chapter.thematicElements = chapter.thematicElements.map(theme => ({
      theme,
      weight: dimensions.thematicResonance / 2.5
    }));

    // Adjust scenes based on weighted dimensions
    chapter.scenes = chapter.scenes.map(scene => ({
      ...scene,
      pacing: Math.min(5, scene.pacing * (dimensions.narrativeMomentum / 2.5)),
      tone: Math.min(5, scene.tone * (dimensions.emotionalDepth / 2.5))
    }));

    return chapter;
  });

  console.log('Dimensional guidance applied successfully');
};

export const validateOutlineStructure = async (
  outline: NovelOutline
): Promise<boolean> => {
  try {
    // Validate outline structure
    if (!outline.chapters || !Array.isArray(outline.chapters)) return false;
    if (!outline.metadata) return false;

    for (const chapter of outline.chapters) {
      if (!chapter.chapterNumber || !chapter.title || !chapter.summary) return false;
      if (!chapter.scenes || !Array.isArray(chapter.scenes)) return false;

      for (const scene of chapter.scenes) {
        if (!scene.id || !scene.sceneFocus || !scene.conflict || !scene.settingDetails) return false;
        if (!scene.characterInvolvement || !Array.isArray(scene.characterInvolvement)) return false;
      }
    }

    if (!outline.metadata.totalEstimatedWordCount || !outline.metadata.mainTheme) return false;

    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};