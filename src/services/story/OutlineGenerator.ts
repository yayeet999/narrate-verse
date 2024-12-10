import { StorySettings, OutlineSection, SceneOutline } from './types';
import { TextAnalyzer } from './utils/TextAnalyzer';

export class OutlineGenerator {
  private settings: StorySettings;

  constructor(settings: StorySettings) {
    this.settings = settings;
  }

  private calculateTotalWordCount(): number {
    const lengthMap = {
      short: 20000,
      medium: 50000,
      long: 100000,
      epic: 150000
    };
    return lengthMap[this.settings.basicSettings.length] || 50000;
  }

  private balanceSceneDistribution(totalScenes: number): number[] {
    const totalChapters = Math.ceil(totalScenes / 3); // Average 3 scenes per chapter
    const distribution = Array(totalChapters).fill(3);
    
    // Adjust for remaining scenes
    const remainingScenes = totalScenes - (totalChapters * 3);
    for (let i = 0; i < Math.abs(remainingScenes); i++) {
      if (remainingScenes > 0) {
        distribution[i % totalChapters]++;
      } else {
        distribution[i % totalChapters]--;
      }
    }
    
    return distribution;
  }

  private calculatePaceTarget(chapterNumber: number, totalChapters: number): number {
    // Pace ranges from 1 (slowest) to 5 (fastest)
    if (chapterNumber <= totalChapters * 0.2) return 3; // Setup
    if (chapterNumber <= totalChapters * 0.4) return 4; // Rising action
    if (chapterNumber <= totalChapters * 0.6) return 3; // Middle development
    if (chapterNumber <= totalChapters * 0.8) return 4; // Rising tension
    if (chapterNumber <= totalChapters * 0.9) return 5; // Climax
    return 2; // Resolution
  }

  private calculateSceneWordCount(
    totalWordCount: number,
    totalScenes: number,
    sceneImportance: number
  ): number {
    const baseCount = Math.floor(totalWordCount / totalScenes);
    const variance = baseCount * 0.2; // 20% variance
    return Math.floor(baseCount + (variance * (sceneImportance - 0.5)));
  }

  private enhanceCharacterPresence(
    scenes: SceneOutline[],
    mainCharacter: string
  ): SceneOutline[] {
    return scenes.map(scene => {
      // Ensure main character appears in key scenes
      if (!scene.characters.includes(mainCharacter)) {
        const isKeyScene = scene.technicalNotes.pacing === 'high' || 
          scene.conflict.toLowerCase().includes('major');
        
        if (isKeyScene) {
          scene.characters = [mainCharacter, ...scene.characters];
        }
      }
      return scene;
    });
  }

  async generateOutline(): Promise<OutlineSection[]> {
    const totalWordCount = this.calculateTotalWordCount();
    const estimatedScenes = Math.ceil(totalWordCount / 2000); // Average scene length
    const sceneDistribution = this.balanceSceneDistribution(estimatedScenes);
    
    const outline: OutlineSection[] = [];
    let currentScene = 1;
    
    for (let chapter = 1; chapter <= sceneDistribution.length; chapter++) {
      const numScenes = sceneDistribution[chapter - 1];
      const paceTarget = this.calculatePaceTarget(chapter, sceneDistribution.length);
      
      const scenes: SceneOutline[] = [];
      for (let i = 0; i < numScenes; i++) {
        const sceneImportance = (paceTarget / 5) * (1 + (i / numScenes));
        scenes.push({
          id: `scene_${currentScene++}`,
          summary: '', // To be filled by AI
          characters: [], // To be filled by AI
          location: '', // To be filled by AI
          conflict: '', // To be filled by AI
          objectives: [], // To be filled by AI
          technicalNotes: {
            pacing: paceTarget >= 4 ? 'high' : paceTarget <= 2 ? 'low' : 'medium',
            tone: this.settings.basicSettings.writingStyle,
            style: this.settings.basicSettings.genre,
            wordCountTarget: this.calculateSceneWordCount(
              totalWordCount,
              estimatedScenes,
              sceneImportance
            )
          }
        });
      }
      
      outline.push({
        chapterNumber: chapter,
        title: `Chapter ${chapter}`, // To be filled by AI
        scenes: this.enhanceCharacterPresence(
          scenes,
          this.settings.characterCreation.characterRole
        ),
        purpose: '', // To be filled by AI
        characters: [], // To be filled by AI
        objectives: [], // To be filled by AI
        technicalNotes: {
          targetWordCount: scenes.reduce(
            (sum, scene) => sum + scene.technicalNotes.wordCountTarget,
            0
          ),
          paceTarget,
          emotionalArc: '', // To be filled by AI
          requiredElements: [] // To be filled by AI
        }
      });
    }
    
    return outline;
  }
}
