import { StorySettings } from '@/types/story';
import { StoryBible, ValidationResult } from './types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface SceneOutline {
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

interface OutlineSection {
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

export class OutlineGenerator {
  private storyBible: StoryBible;
  private settings: StorySettings;
  private targetChapterCount: number;
  private retryAttempts = 3;
  private retryDelay = 1000; // milliseconds
  
  constructor(storyBible: StoryBible, settings: StorySettings) {
    this.storyBible = storyBible;
    this.settings = settings;
    this.targetChapterCount = this.calculateTargetChapters();
  }

  async generateInitialOutline(): Promise<OutlineSection[]> {
    try {
      // Create structural framework
      const structure = await this.createStructuralFramework();

      // Generate chapter outlines
      const chapters = await this.generateChapterOutlines(structure);

      // Validate initial outline
      const validationResult = await this.validateOutline(chapters);
      if (!validationResult.success) {
        throw new Error(`Outline validation failed: ${validationResult.error}`);
      }

      return chapters;
    } catch (error) {
      console.error('Initial outline generation failed:', error);
      throw new Error(`Initial outline generation failed: ${error.message}`);
    }
  }

  async refineOutline(outline: OutlineSection[], pass: 'first' | 'second'): Promise<OutlineSection[]> {
    try {
      let refinedOutline = [...outline];

      if (pass === 'first') {
        // First pass focuses on structure and pacing
        refinedOutline = await this.improveStructureAndPacing(refinedOutline);
        refinedOutline = await this.enhanceCharacterArcs(refinedOutline);
        refinedOutline = await this.balanceSceneDistribution(refinedOutline);
      } else {
        // Second pass focuses on details and consistency
        refinedOutline = await this.enhanceSceneDetails(refinedOutline);
        refinedOutline = await this.improveThematicElements(refinedOutline);
        refinedOutline = await this.finalizeTransitions(refinedOutline);
      }

      // Validate refined outline
      const validationResult = await this.validateOutline(refinedOutline);
      if (!validationResult.success) {
        throw new Error(`Outline refinement validation failed: ${validationResult.error}`);
      }

      return refinedOutline;
    } catch (error) {
      console.error('Outline refinement failed:', error);
      throw new Error(`Outline refinement failed: ${error.message}`);
    }
  }

  private calculateTargetChapters(): number {
    const lengthMap = {
      '5-10': { min: 5, max: 7 },
      '10-20': { min: 8, max: 12 },
      '20-30': { min: 12, max: 15 }
    };
    const range = lengthMap[this.settings.basicSettings.length as keyof typeof lengthMap];
    return Math.floor((range.min + range.max) / 2);
  }

  private async createStructuralFramework() {
    // Calculate chapter distribution based on story structure
    const structure = {
      exposition: this.calculateExpositionChapters(),
      risingAction: this.calculateRisingActionChapters(),
      climax: this.calculateClimaxChapters(),
      fallingAction: this.calculateFallingActionChapters(),
      resolution: this.calculateResolutionChapters()
    };

    // Validate structure adds up to target chapter count
    const total = Object.values(structure).reduce((sum, count) => sum + count, 0);
    if (total !== this.targetChapterCount) {
      throw new Error('Structural framework chapter count mismatch');
    }

    return structure;
  }

  private calculateExpositionChapters(): number {
    const baseCount = Math.max(1, Math.floor(this.targetChapterCount * 0.2));
    const complexityFactor = this.determineComplexityFactor();
    return Math.min(baseCount + complexityFactor, Math.floor(this.targetChapterCount * 0.3));
  }

  private calculateRisingActionChapters(): number {
    return Math.floor(this.targetChapterCount * 0.4);
  }

  private calculateClimaxChapters(): number {
    return Math.min(2, Math.floor(this.targetChapterCount * 0.15));
  }

  private calculateFallingActionChapters(): number {
    return Math.floor(this.targetChapterCount * 0.15);
  }

  private calculateResolutionChapters(): number {
    return Math.max(1, Math.floor(this.targetChapterCount * 0.1));
  }

  private determineComplexityFactor(): number {
    const worldDepth = this.settings.worldBuilding.settingDetail;
    const characterComplexity = this.storyBible.characters.supportingCharacters.length;
    return Math.floor((worldDepth + characterComplexity) / 4);
  }

  private async generateChapterOutlines(
    structure: ReturnType<typeof this.createStructuralFramework>
  ): Promise<OutlineSection[]> {
    const chapters: OutlineSection[] = [];
    let chapterNumber = 1;

    // Generate chapters for each structural section
    for (const [section, count] of Object.entries(structure)) {
      for (let i = 0; i < count; i++) {
        const chapter = await this.retryOperation(
          () => this.generateChapter(section, chapterNumber, structure),
          `Failed to generate chapter ${chapterNumber}`
        );
        chapters.push(chapter);
        chapterNumber++;
      }
    }

    return chapters;
  }

  private async generateChapter(
    structuralSection: string,
    chapterNumber: number,
    structure: ReturnType<typeof this.createStructuralFramework>
  ): Promise<OutlineSection> {
    try {
      const chapterPrompt = `
        Create a detailed chapter outline for chapter ${chapterNumber} in the ${structuralSection} section.
        Genre: ${this.settings.basicSettings.genre}
        Writing Style: ${this.settings.basicSettings.writingStyle}
        Story Context: ${JSON.stringify(this.storyBible.plot.structure)}
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert story outliner, focusing on creating detailed chapter structures.'
          },
          {
            role: 'user',
            content: chapterPrompt
          }
        ],
        temperature: 0.7
      });

      const chapterData = JSON.parse(completion.choices[0].message.content);

      // Generate scenes for the chapter
      const scenes = await this.generateScenes(
        structuralSection,
        chapterNumber,
        chapterData.characters,
        chapterData.objectives
      );

      return {
        chapterNumber,
        title: chapterData.title,
        scenes,
        purpose: chapterData.purpose,
        characters: chapterData.characters,
        objectives: chapterData.objectives,
        technicalNotes: {
          targetWordCount: this.calculateTargetWordCount(structuralSection),
          paceTarget: this.calculatePaceTarget(structuralSection, chapterNumber),
          emotionalArc: chapterData.emotionalArc,
          requiredElements: chapterData.requiredElements
        }
      };
    } catch (error) {
      console.error(`Failed to generate chapter ${chapterNumber}:`, error);
      throw error;
    }
  }

  private async generateScenes(
    structuralSection: string,
    chapterNumber: number,
    requiredCharacters: string[],
    objectives: string[]
  ): Promise<SceneOutline[]> {
    const sceneCount = this.calculateSceneCount(structuralSection, chapterNumber);
    const scenes: SceneOutline[] = [];

    for (let i = 0; i < sceneCount; i++) {
      const scene = await this.retryOperation(
        () => this.generateScene(
          structuralSection,
          chapterNumber,
          i + 1,
          requiredCharacters,
          objectives
        ),
        `Failed to generate scene ${i + 1} for chapter ${chapterNumber}`
      );
      scenes.push(scene);
    }

    return scenes;
  }

  private async generateScene(
    structuralSection: string,
    chapterNumber: number,
    sceneNumber: number,
    requiredCharacters: string[],
    objectives: string[]
  ): Promise<SceneOutline> {
    try {
      const scenePrompt = `
        Create a detailed scene outline for scene ${sceneNumber} in chapter ${chapterNumber}.
        Section: ${structuralSection}
        Characters: ${requiredCharacters.join(', ')}
        Objectives: ${objectives.join(', ')}
        Style: ${this.settings.basicSettings.writingStyle}
        Pacing: ${this.settings.pacingStyle.plotDevelopment}/5
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scene designer, focusing on creating engaging and purposeful scenes.'
          },
          {
            role: 'user',
            content: scenePrompt
          }
        ],
        temperature: 0.7
      });

      const sceneData = JSON.parse(completion.choices[0].message.content);

      return {
        id: `ch${chapterNumber}_s${sceneNumber}`,
        summary: sceneData.summary,
        characters: sceneData.characters,
        location: sceneData.location,
        conflict: sceneData.conflict,
        objectives: sceneData.objectives,
        technicalNotes: {
          pacing: sceneData.pacing,
          tone: sceneData.tone,
          style: this.settings.basicSettings.writingStyle,
          wordCountTarget: this.calculateSceneWordCount(structuralSection, sceneNumber)
        }
      };
    } catch (error) {
      console.error(`Failed to generate scene ${sceneNumber}:`, error);
      throw error;
    }
  }

  private calculateSceneCount(structuralSection: string, chapterNumber: number): number {
    const baseCount = this.settings.pacingStyle.plotDevelopment > 3 ? 3 : 4;
    
    const sectionModifiers = {
      exposition: 1,
      risingAction: 0,
      climax: -1,
      fallingAction: 0,
      resolution: 1
    };

    return baseCount + (sectionModifiers[structuralSection as keyof typeof sectionModifiers] || 0);
  }

  private async improveStructureAndPacing(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const refined = [...outline];

    // Analyze and adjust pacing
    for (let i = 0; i < refined.length; i++) {
      refined[i] = await this.adjustChapterPacing(refined[i], i, refined.length);
    }

    // Balance scene lengths
    refined.forEach(chapter => {
      chapter.scenes = this.balanceSceneLengths(chapter.scenes);
    });

    // Distribute story beats
    this.distributeStoryBeats(refined);

    return refined;
  }

  private async adjustChapterPacing(
    chapter: OutlineSection,
    index: number,
    totalChapters: number
  ): Promise<OutlineSection> {
    const storyProgress = index / totalChapters;
    const targetPacing = this.calculateTargetPacing(storyProgress);

    const pacingPrompt = `
      Adjust the pacing of the following chapter outline to match a target pacing of ${targetPacing}/5:
      ${JSON.stringify(chapter)}
      
      Consider:
      - Story Progress: ${Math.round(storyProgress * 100)}%
      - Overall Pacing: ${this.settings.pacingStyle.plotDevelopment}/5
      - Genre Requirements: ${this.settings.basicSettings.genre}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in story pacing and rhythm.'
        },
        {
          role: 'user',
          content: pacingPrompt
        }
      ],
      temperature: 0.7
    });

    return {
      ...chapter,
      ...JSON.parse(completion.choices[0].message.content)
    };
  }

  private balanceSceneLengths(scenes: SceneOutline[]): SceneOutline[] {
    const totalWords = this.calculateChapterWordCount();
    const baseSceneLength = Math.floor(totalWords / scenes.length);

    return scenes.map((scene, index) => ({
      ...scene,
      technicalNotes: {
        ...scene.technicalNotes,
        wordCountTarget: this.adjustSceneWordCount(baseSceneLength, scene.conflict, index)
      }
    }));
  }

  private distributeStoryBeats(outline: OutlineSection[]): void {
    const mainPlot = this.storyBible.plot.structure.mainPlot;
    const beats = [
      mainPlot.hook,
      mainPlot.incitingIncident,
      ...mainPlot.risingAction,
      mainPlot.climax,
      mainPlot.resolution
    ];

    beats.forEach((beat, index) => {
      const targetChapter = Math.floor((index / beats.length) * outline.length);
      if (outline[targetChapter]) {
        outline[targetChapter].objectives.push(beat);
      }
    });
  }

  private async enhanceCharacterArcs(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const characterArcs = this.mapCharacterArcs();
    const refined = [...outline];

    for (const chapter of refined) {
      const arcPrompt = `
        Enhance character development in the following chapter:
        ${JSON.stringify(chapter)}
        
        Character Arcs:
        ${JSON.stringify(Array.from(characterArcs.entries()))}
        
        Story Progress: ${(chapter.chapterNumber / refined.length) * 100}%
      `;

      const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in character development and arc progression.'
            },
            {
              role: 'user',
              content: arcPrompt
            }
          ],
          temperature: 0.7
        });

        const enhancedChapter = JSON.parse(completion.choices[0].message.content);
        chapter.scenes = this.enhanceCharacterPresence(
          enhancedChapter.scenes,
          characterArcs,
          chapter.chapterNumber / refined.length
        );
      }

      return refined;
  }

  private async balanceSceneDistribution(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const refined = [...outline];
    const distribution = this.analyzeSceneDistribution(refined);

    refined.forEach(chapter => {
      chapter.scenes = this.redistributeScenes(chapter.scenes, distribution);
    });

    return refined;
  }

  private analyzeSceneDistribution(outline: OutlineSection[]): Map<string, number> {
    const distribution = new Map<string, number>();

    outline.forEach(chapter => {
      chapter.scenes.forEach(scene => {
        scene.characters.forEach(char => {
          distribution.set(char, (distribution.get(char) || 0) + 1);
        });
      });
    });

    return distribution;
  }

  private redistributeScenes(
    scenes: SceneOutline[],
    distribution: Map<string, number>
  ): SceneOutline[] {
    const averageAppearances = Array.from(distribution.values())
      .reduce((sum, count) => sum + count, 0) / distribution.size;

    return scenes.map(scene => {
      const underrepresentedCharacters = Array.from(distribution.entries())
        .filter(([_, count]) => count < averageAppearances * 0.7)
        .map(([char]) => char);

      if (underrepresentedCharacters.length > 0 && Math.random() > 0.7) {
        scene.characters.push(underrepresentedCharacters[0]);
      }

      return scene;
    });
  }

  private async enhanceSceneDetails(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const refined = [...outline];

    for (let i = 0; i < refined.length; i++) {
      const chapter = refined[i];
      const enhancedScenes = await Promise.all(
        chapter.scenes.map(scene => this.enhanceScene(scene, i, refined.length))
      );
      chapter.scenes = enhancedScenes;
    }

    return refined;
  }

  private async enhanceScene(
    scene: SceneOutline,
    chapterIndex: number,
    totalChapters: number
  ): Promise<SceneOutline> {
    const scenePrompt = `
      Enhance the following scene with more detailed description and sensory elements:
      ${JSON.stringify(scene)}
      
      Consider:
      - Writing Style: ${this.settings.basicSettings.writingStyle}
      - Story Progress: ${(chapterIndex / totalChapters) * 100}%
      - World Detail Level: ${this.settings.worldBuilding.settingDetail}/5
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in scene crafting and descriptive writing.'
        },
        {
          role: 'user',
          content: scenePrompt
        }
      ],
      temperature: 0.7
    });

    const enhancedScene = JSON.parse(completion.choices[0].message.content);
    return {
      ...scene,
      ...enhancedScene
    };
  }

  private async improveThematicElements(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const themes = this.storyBible.plot.themes;
    const refined = [...outline];

    for (let i = 0; i < refined.length; i++) {
      const chapter = refined[i];
      const thematicPrompt = `
        Enhance thematic elements in the following chapter:
        ${JSON.stringify(chapter)}
        
        Themes:
        Primary: ${themes.primary}
        Secondary: ${themes.secondary.join(', ')}
        Symbols: ${themes.symbolism.join(', ')}
        Motifs: ${themes.motifs.join(', ')}
        
        Story Progress: ${(i / refined.length) * 100}%
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in thematic development and symbolism.'
          },
          {
            role: 'user',
            content: thematicPrompt
          }
        ],
        temperature: 0.7
      });

      const enhancedChapter = JSON.parse(completion.choices[0].message.content);
      refined[i] = enhancedChapter;
    }

    return refined;
  }

  private async finalizeTransitions(outline: OutlineSection[]): Promise<OutlineSection[]> {
    const refined = [...outline];

    // Enhance transitions between chapters
    for (let i = 1; i < refined.length; i++) {
      await this.enhanceChapterTransition(refined[i - 1], refined[i]);
    }

    // Enhance scene transitions within chapters
    for (const chapter of refined) {
      chapter.scenes = await this.enhanceSceneTransitions(chapter.scenes);
    }

    return refined;
  }

  private async enhanceChapterTransition(
    previousChapter: OutlineSection,
    nextChapter: OutlineSection
  ): Promise<void> {
    const transitionPrompt = `
      Create a smooth transition between these consecutive chapters:
      Previous Chapter: ${JSON.stringify(previousChapter)}
      Next Chapter: ${JSON.stringify(nextChapter)}
      
      Writing Style: ${this.settings.basicSettings.writingStyle}
      Pacing: ${this.settings.pacingStyle.plotDevelopment}/5
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in narrative transitions and story flow.'
        },
        {
          role: 'user',
          content: transitionPrompt
        }
      ],
      temperature: 0.7
    });

    const transitionElements = JSON.parse(completion.choices[0].message.content);
    
    // Apply transition elements
    const lastScene = previousChapter.scenes[previousChapter.scenes.length - 1];
    const firstScene = nextChapter.scenes[0];

    lastScene.objectives.push(transitionElements.outgoing);
    firstScene.objectives.push(transitionElements.incoming);
  }

  private async enhanceSceneTransitions(scenes: SceneOutline[]): Promise<SceneOutline[]> {
    const enhanced = [...scenes];

    for (let i = 1; i < enhanced.length; i++) {
      const transitionPrompt = `
        Create a smooth transition between these consecutive scenes:
        Previous Scene: ${JSON.stringify(enhanced[i - 1])}
        Next Scene: ${JSON.stringify(enhanced[i])}
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in scene transitions and narrative flow.'
          },
          {
            role: 'user',
            content: transitionPrompt
          }
        ],
        temperature: 0.7
      });

      const transition = JSON.parse(completion.choices[0].message.content);
      enhanced[i].summary = `${transition.bridgingElement} ${enhanced[i].summary}`;
    }

    return enhanced;
  }

  private async validateOutline(outline: OutlineSection[]): Promise<ValidationResult> {
    try {
      // Validate structural integrity
      if (!this.validateStructure(outline)) {
        return {
          success: false,
          error: 'Invalid outline structure'
        };
      }

      // Validate character arcs
      if (!this.validateCharacterArcs(outline)) {
        return {
          success: false,
          error: 'Character arc validation failed'
        };
      }

      // Validate plot progression
      if (!this.validatePlotProgression(outline)) {
        return {
          success: false,
          error: 'Plot progression validation failed'
        };
      }

      // Validate thematic consistency
      if (!this.validateThematicConsistency(outline)) {
        return {
          success: false,
          error: 'Thematic consistency validation failed'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Outline validation failed: ${error.message}`
      };
    }
  }

  private validateStructure(outline: OutlineSection[]): boolean {
    return outline.some(chapter => 
      chapter.purpose.toLowerCase().includes('exposition')
    ) && outline.some(chapter => 
      chapter.purpose.toLowerCase().includes('climax')
    ) && outline.some(chapter => 
      chapter.purpose.toLowerCase().includes('resolution')
    );
  }

  private validateCharacterArcs(outline: OutlineSection[]): boolean {
    const characterArcs = this.mapCharacterArcs();
    const progressions = new Map<string, number>();

    outline.forEach(chapter => {
      chapter.scenes.forEach(scene => {
        scene.characters.forEach(char => {
          progressions.set(char, (progressions.get(char) || 0) + 1);
        });
      });
    });

    return Array.from(characterArcs.keys()).every(char => 
      (progressions.get(char) || 0) >= 3
    );
  }

  private validatePlotProgression(outline: OutlineSection[]): boolean {
    const plotPoints = this.storyBible.plot.structure.mainPlot;
    let foundPoints = 0;

    outline.forEach(chapter => {
      chapter.objectives.forEach(objective => {
        if (Object.values(plotPoints).some(point => 
          objective.includes(point.toString())
        )) {
          foundPoints++;
        }
      });
    });

    return foundPoints >= Object.keys(plotPoints).length;
  }

  private validateThematicConsistency(outline: OutlineSection[]): boolean {
    const themes = this.storyBible.plot.themes;
    let thematicElements = 0;

    outline.forEach(chapter => {
      chapter.scenes.forEach(scene => {
        scene.objectives.forEach(objective => {
          if (themes.symbolism.some(symbol => objective.includes(symbol)) ||
              themes.motifs.some(motif => objective.includes(motif))) {
            thematicElements++;
          }
        });
      });
    });

    return thematicElements >= outline.length * 2;
  }

  private mapCharacterArcs(): Map<string, string[]> {
    const arcs = new Map<string, string[]>();
    
    // Map main character arc
    const mainChar = this.storyBible.characters.mainCharacter;
    arcs.set('protagonist', [
      mainChar.arc.startingPoint,
      ...mainChar.arc.majorChanges,
      mainChar.arc.endPoint
    ]);

    // Map supporting character arcs
    this.storyBible.characters.supportingCharacters.forEach(char => {
      arcs.set(char.role, [char.arc]);
    });

    return arcs;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw new Error(`${errorMessage}: ${lastError?.message}`);
  }

  private calculateTargetWordCount(section: string): number {
    const totalWords = this.calculateChapterWordCount();
    const multiplier = this.getWordCountMultiplier(section);
    return Math.floor(totalWords * multiplier);
  }

  private calculateChapterWordCount(): number {
    const lengthMap = {
      '5-10': 2000,
      '10-20': 4000,
      '20-30': 6000
    };
    return lengthMap[this.settings.basicSettings.length as keyof typeof lengthMap] || 4000;
  }

  private getWordCountMultiplier(section: string): number {
    const multipliers = {
      exposition: 1.2,
      risingAction: 1.0,
      climax: 0.8,
      fallingAction: 1.0,
      resolution: 1.1
    };
    return multipliers[section as keyof typeof multipliers] || 1.0;
  }

  private calculateTargetPacing(progress: number): number {
    const basePacing = this.settings.pacingStyle.plotDevelopment;
    const progressEffect = Math.sin(progress * Math.PI) * 2;
    return Math.max(1, Math.min(5, basePacing + progressEffect));
  }

  private adjustSceneWordCount(
    baseCount: number,
    conflict: string,
    sceneIndex: number
  ): number {
    let count = baseCount;
    
    // Adjust based on conflict complexity
    count *= (conflict.split(' ').length > 20) ? 1.2 : 0.8;
    
    // Adjust based on scene position
    count *= (sceneIndex === 0 || sceneIndex === -1) ? 1.1 : 1.0;
    
    return Math.floor(count);
  }
}
