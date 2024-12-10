import { StoryBible } from './StoryBibleGenerator';
import { OutlineSection } from './OutlineGenerator';
import { StorySettings } from '@/types/story';
import { ValidationResult } from './types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ChapterSummary {
  chapterNumber: number;
  keyEvents: string[];
  characterDevelopments: Map<string, string>;
  plotProgress: string;
  thematicDevelopments: string[];
}

interface ChapterPair {
  firstChapter: {
    content: string;
    summary: ChapterSummary;
  };
  secondChapter: {
    content: string;
    summary: ChapterSummary;
  } | null;
}

interface GenerationContext {
  storyBible: StoryBible;
  settings: StorySettings;
  outline: OutlineSection[];
  previousSummaries: ChapterSummary[];
  currentChapterIndex: number;
}

interface ChapterPrompt {
  context: {
    storyContext: {
      genre: string;
      worldType: string;
      mood: number;
    };
    previousEvents: string[];
    characterStates: Map<string, string>;
    plotProgress: string;
    thematicProgress: string[];
  };
  requirements: {
    scenes: any[];
    characters: string[];
    plot: string[];
    pacing: number;
  };
  style: {
    tone: number;
    writingStyle: string;
    dialogueStyle: string;
    descriptionStyle: string;
  };
  technical: {
    wordCountTarget: number;
    pacing: number;
    dialogueRatio: number;
    sceneTransitions: string[];
  };
  outline: OutlineSection;
}

export class ChapterGenerator {
  private context: GenerationContext;
  private retryAttempts = 3;
  private retryDelay = 1000; // milliseconds
  private maxTokensPerRequest = 4000;
  
  constructor(
    storyBible: StoryBible,
    settings: StorySettings,
    outline: OutlineSection[],
    previousSummaries: ChapterSummary[] = []
  ) {
    this.context = {
      storyBible,
      settings,
      outline,
      previousSummaries,
      currentChapterIndex: previousSummaries.length
    };
  }

  async generateChapterPair(): Promise<ChapterPair> {
    try {
      // Get current chapters from outline
      const firstChapterOutline = this.context.outline[this.context.currentChapterIndex];
      const secondChapterOutline = this.context.outline[this.context.currentChapterIndex + 1];

      if (!firstChapterOutline) {
        throw new Error('No more chapters to generate');
      }

      // Generate first chapter
      const firstChapterPrompt = await this.buildChapterPrompt(firstChapterOutline);
      const firstChapter = await this.retryOperation(
        () => this.generateChapter(firstChapterPrompt),
        'First chapter generation failed'
      );

      await this.validateChapter(firstChapter, firstChapterOutline);
      const firstChapterSummary = await this.generateChapterSummary(firstChapter, firstChapterOutline);

      // Update context with first chapter
      this.context.previousSummaries.push(firstChapterSummary);

      // Generate second chapter if available
      let secondChapter = null;
      let secondChapterSummary = null;

      if (secondChapterOutline) {
        const secondChapterPrompt = await this.buildChapterPrompt(secondChapterOutline);
        secondChapter = await this.retryOperation(
          () => this.generateChapter(secondChapterPrompt),
          'Second chapter generation failed'
        );

        await this.validateChapter(secondChapter, secondChapterOutline);
        secondChapterSummary = await this.generateChapterSummary(secondChapter, secondChapterOutline);
        this.context.previousSummaries.push(secondChapterSummary);
      }

      this.context.currentChapterIndex += secondChapter ? 2 : 1;

      return {
        firstChapter: {
          content: firstChapter,
          summary: firstChapterSummary
        },
        secondChapter: secondChapter ? {
          content: secondChapter,
          summary: secondChapterSummary!
        } : null
      };

    } catch (error) {
      throw new Error(`Chapter pair generation failed: ${error.message}`);
    }
  }

  private async buildChapterPrompt(chapterOutline: OutlineSection): Promise<ChapterPrompt> {
    return {
      context: await this.buildContextSection(),
      requirements: await this.buildRequirementsSection(chapterOutline),
      style: this.buildStyleSection(),
      technical: this.buildTechnicalSection(),
      outline: chapterOutline
    };
  }

  private async buildContextSection() {
    const previousEvents = await this.summarizePreviousChapters();
    const characterStates = await this.getCurrentCharacterStates();
    const plotProgress = await this.getPlotProgressStatus();
    const thematicProgress = await this.getThematicProgressStatus();

    return {
      storyContext: {
        genre: this.context.settings.basicSettings.genre,
        worldType: this.context.settings.worldBuilding.worldType,
        mood: this.context.settings.pacingStyle.overallMood
      },
      previousEvents,
      characterStates,
      plotProgress,
      thematicProgress
    };
  }

  private async buildRequirementsSection(chapterOutline: OutlineSection) {
    return {
      scenes: await this.getSceneRequirements(chapterOutline),
      characters: await this.getCharacterRequirements(chapterOutline),
      plot: await this.getPlotRequirements(chapterOutline),
      pacing: this.getPacingRequirements(chapterOutline)
    };
  }

  private buildStyleSection() {
    const { writingStyle } = this.context.settings.basicSettings;
    const { dialogNarrative } = this.context.settings.pacingStyle;

    return {
      tone: this.context.settings.pacingStyle.overallMood,
      writingStyle,
      dialogueStyle: this.getDialogueStyleGuidelines(dialogNarrative),
      descriptionStyle: this.getDescriptionStyleGuidelines()
    };
  }

  private buildTechnicalSection() {
    return {
      wordCountTarget: this.calculateWordCountTarget(),
      pacing: this.context.settings.pacingStyle.plotDevelopment,
      dialogueRatio: this.context.settings.pacingStyle.dialogNarrative,
      sceneTransitions: this.getTransitionGuidelines()
    };
  }

  private async generateChapter(prompt: ChapterPrompt): Promise<string> {
    const systemPrompt = `You are a creative writing expert specializing in ${prompt.context.storyContext.genre} stories. 
    Write in a ${prompt.style.writingStyle} style with ${prompt.style.dialogueStyle} dialogue and ${prompt.style.descriptionStyle} descriptions.`;

    const userPrompt = this.formatChapterPrompt(prompt);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: this.maxTokensPerRequest,
        presence_penalty: 0.6,
        frequency_penalty: 0.8
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      throw new Error(`Chapter generation failed: ${error.message}`);
    }
  }

  private async validateChapter(
    chapter: string,
    outline: OutlineSection
  ): Promise<ValidationResult> {
    const validations = [
      this.validateContent(chapter, outline),
      this.validateStyle(chapter),
      this.validateContinuity(chapter),
      this.validateTechnicalRequirements(chapter, outline)
    ];

    const results = await Promise.all(validations);
    const failures = results.filter(result => !result.success);

    if (failures.length > 0) {
      throw new Error(`Chapter validation failed: ${failures.map(f => f.error).join(', ')}`);
    }

    return { success: true };
  }

  private async validateContent(
    chapter: string,
    outline: OutlineSection
  ): Promise<ValidationResult> {
    try {
      // Check scene presence and requirements
      for (const scene of outline.scenes) {
        // Verify scene elements
        if (!this.findSceneElements(chapter, scene)) {
          return {
            success: false,
            error: `Missing required elements in scene: ${scene.id}`
          };
        }

        // Verify character presence
        for (const character of scene.characters) {
          if (!this.findCharacterPresence(chapter, character, scene)) {
            return {
              success: false,
              error: `Character ${character} missing from scene ${scene.id}`
            };
          }
        }

        // Verify objectives
        for (const objective of scene.objectives) {
          if (!this.findObjectiveCompletion(chapter, objective, scene)) {
            return {
              success: false,
              error: `Objective not met in scene ${scene.id}: ${objective}`
            };
          }
        }
      }

      // Verify overall chapter objectives
      for (const objective of outline.objectives) {
        if (!this.findChapterObjective(chapter, objective)) {
          return {
            success: false,
            error: `Chapter objective not met: ${objective}`
          };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Content validation failed: ${error.message}`
      };
    }
  }

  private async validateStyle(chapter: string): Promise<ValidationResult> {
    try {
      const styleChecks = [
        this.checkWritingStyle(chapter),
        this.checkDialogueStyle(chapter),
        this.checkDescriptiveStyle(chapter),
        this.checkVoiceConsistency(chapter)
      ];

      const results = await Promise.all(styleChecks);
      const failures = results.filter(result => !result.success);

      if (failures.length > 0) {
        return {
          success: false,
          error: failures.map(f => f.error).join(', ')
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Style validation failed: ${error.message}`
      };
    }
  }

  private async validateContinuity(chapter: string): Promise<ValidationResult> {
    try {
      // Check consistency with previous chapters
      if (this.context.previousSummaries.length > 0) {
        const continuityIssues = await this.checkContinuityWithPrevious(chapter);
        if (continuityIssues.length > 0) {
          return {
            success: false,
            error: `Continuity issues: ${continuityIssues.join(', ')}`
          };
        }
      }

      // Check internal consistency
      const internalIssues = await this.checkInternalConsistency(chapter);
      if (internalIssues.length > 0) {
        return {
          success: false,
          error: `Internal consistency issues: ${internalIssues.join(', ')}`
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Continuity validation failed: ${error.message}`
      };
    }
  }

  private async validateTechnicalRequirements(
    chapter: string,
    outline: OutlineSection
  ): Promise<ValidationResult> {
    try {
      // Verify word count
      const wordCount = this.countWords(chapter);
      const targetCount = outline.technicalNotes.targetWordCount;
      const tolerance = 0.1; // 10% tolerance

      if (Math.abs(wordCount - targetCount) > targetCount * tolerance) {
        return {
          success: false,
          error: `Word count ${wordCount} outside acceptable range (${targetCount} ± ${targetCount * tolerance})`
        };
      }

      // Verify pacing
      const pacingScore = await this.analyzePacing(chapter);
      if (Math.abs(pacingScore - outline.technicalNotes.paceTarget) > 1) {
        return {
          success: false,
          error: 'Pacing does not match target'
        };
      }

      // Verify dialogue ratio
      const dialogueRatio = await this.analyzeDialogueRatio(chapter);
      const targetRatio = this.context.settings.pacingStyle.dialogNarrative / 5;
      if (Math.abs(dialogueRatio - targetRatio) > 0.1) {
        return {
          success: false,
          error: 'Dialogue ratio outside acceptable range'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Technical validation failed: ${error.message}`
      };
    }
  }

  private async summarizePreviousChapters(): Promise<string[]> {
    return this.context.previousSummaries.map(summary => {
      const events = summary.keyEvents.join('. ');
      const characters = Array.from(summary.characterDevelopments.entries())
        .map(([char, dev]) => `${char}: ${dev}`)
        .join('; ');
      return `Chapter ${summary.chapterNumber}: ${events}. Characters - ${characters}`;
    });
  }

  private async getCurrentCharacterStates(): Promise<Map<string, string>> {
    const states = new Map<string, string>();

    // Track main character development
    const mainChar = this.context.storyBible.characters.mainCharacter;
    const mainCharProgress = this.calculateCharacterProgress('protagonist');
    states.set('protagonist', mainCharProgress);

    // Track supporting characters
    this.context.storyBible.characters.supportingCharacters.forEach(char => {
      const charProgress = this.calculateCharacterProgress(char.role);
      states.set(char.role, charProgress);
    });

    return states;
  }

  private calculateCharacterProgress(role: string): string {
    const developments = this.context.previousSummaries
      .flatMap(summary => Array.from(summary.characterDevelopments.entries()))
      .filter(([char, _]) => char === role)
      .map(([_, dev]) => dev);

    return developments.length > 0 ? developments[developments.length - 1] : 'Initial state';
  }

  private async getPlotProgressStatus(): Promise<string> {
    const completedEvents = this.context.previousSummaries
      .flatMap(summary => summary.keyEvents);

    const mainPlot = this.context.storyBible.plot.structure.mainPlot;
    const completedPlotPoints = [
      mainPlot.hook,
      mainPlot.incitingIncident,
      ...mainPlot.risingAction,
      mainPlot.climax,
      mainPlot.resolution
    ].filter(point => 
      completedEvents.some(event => event.includes(point))
    );

    const progress = completedPlotPoints.length / (mainPlot.risingAction.length + 4); // +4 for hook, inciting, climax, resolution
    return `${Math.round(progress * 100)}% of main plot points completed. Current phase: ${this.determineCurrentPlotPhase(completedPlotPoints)}`;
  }

  private determineCurrentPlotPhase(completedPoints: string[]): string {
    if (!completedPoints.includes(this.context.storyBible.plot.structure.mainPlot.hook)) {
      return 'Setup';
    } else if (!completedPoints.includes(this.context.storyBible.plot.structure.mainPlot.incitingIncident)) {
      return 'Introduction';
    } else if (completedPoints.length < this.context.storyBible.plot.structure.mainPlot.risingAction.length / 2) {
      return 'Rising Action (Early)';
    } else if (!completedPoints.includes(this.context.storyBible.plot.structure.mainPlot.climax)) {
      return 'Rising Action (Late)';
    } else if (!completedPoints.includes(this.context.storyBible.plot.structure.mainPlot.resolution)) {
      return 'Falling Action';
    } else {
      return 'Resolution';
    }
  }

  private async getThematicProgressStatus(): Promise<string[]> {
    const thematicDevelopments = this.context.previousSummaries
      .flatMap(summary => summary.thematicDevelopments);

    return this.context.storyBible.plot.themes.symbolism.map(symbol => {
      const occurrences = thematicDevelopments.filter(dev => dev.includes(symbol)).length;
      return `${symbol}: ${occurrences} developments`;
    });
  }

  private async getSceneRequirements(outline: OutlineSection): Promise<any[]> {
    return outline.scenes.map(scene => ({
      id: scene.id,
      requirements: {
        characters: scene.characters,
        location: scene.location,
        conflict: scene.conflict,
        objectives: scene.objectives,
        wordCount: scene.technicalNotes.wordCountTarget
      }
    }));
  }

  private async getCharacterRequirements(outline: OutlineSection): Promise<string[]> {
    const mainChar = this.context.storyBible.characters.mainCharacter;
    const requiredCharacters = new Set([
      ...outline.characters,
      mainChar.profile.role
    ]);

    return Array.from(requiredCharacters);
  }

  private async getPlotRequirements(outline: OutlineSection): Promise<string[]> {
    return outline.objectives.map(objective => ({
      objective,
      requiredElements: this.getRequiredElementsForObjective(objective)
    }));
  }

  private getRequiredElementsForObjective(objective: string): string[] {
    // Extract required story elements based on objective type
    const requirements: string[] = [];

    if (objective.includes('character development')) {
      requirements.push('internal monologue', 'character interaction');
    }
    if (objective.includes('plot advancement')) {
      requirements.push('action sequence', 'consequence revelation');
    }
    if (objective.includes('world building')) {
      requirements.push('setting description', 'cultural detail');
    }

    return requirements;
  }

  private getPacingRequirements(outline: OutlineSection): number {
    return outline.technicalNotes.paceTarget;
  }

  private getDialogueStyleGuidelines(dialogueRatio: number): string {
    const styles = {
      1: 'sparse and meaningful',
      2: 'reserved but important',
      3: 'balanced with narration',
      4: 'frequent and expressive',
      5: 'dominant and character-driven'
    };
    return styles[dialogueRatio as keyof typeof styles] || 'balanced with narration';
  }

  private getDescriptionStyleGuidelines(): string {
    const settingDetail = this.context.settings.worldBuilding.settingDetail;
    const styles = {
      1: 'minimal and focused',
      2: 'selective and pointed',
      3: 'balanced and clear',
      4: 'detailed and immersive',
      5: 'rich and comprehensive'
    };
    return styles[settingDetail as keyof typeof styles] || 'balanced and clear';
  }

  private getTransitionGuidelines(): string[] {
    return [
      'Use scene breaks for major shifts in time or location',
      'Bridge scenes with thematic elements',
      'Maintain emotional continuity',
      'Echo previous scene elements where appropriate'
    ];
  }

  private calculateWordCountTarget(): number {
    const baseCount = {
      '5-10': 1500,
      '10-20': 2500,
      '20-30': 3500
    }[this.context.settings.basicSettings.length] || 2500;

    const paceMultiplier = {
      1: 1.2, // Slower pace = more words
      2: 1.1,
      3: 1.0,
      4: 0.9,
      5: 0.8  // Faster pace = fewer words
    }[this.context.settings.pacingStyle.plotDevelopment] || 1.0;

    return Math.floor(baseCount * paceMultiplier);
  }

  private async findSceneElements(chapter: string, scene: any): Promise<boolean> {
    const elements = [
      scene.location,
      scene.conflict,
      ...scene.characters
    ];

    return elements.every(element => 
      chapter.toLowerCase().includes(element.toLowerCase())
    );
  }

  private async findCharacterPresence(
    chapter: string,
    character: string,
    scene: any
  ): Promise<boolean> {
    // Check for character name mentions
    if (!chapter.toLowerCase().includes(character.toLowerCase())) {
      return false;
    }

    // Check for character actions
    const characterActions = await this.extractCharacterActions(chapter, character);
    return characterActions.length > 0;
  }

  private async findObjectiveCompletion(
    chapter: string,
    objective: string,
    scene: any
  ): Promise<boolean> {
    // Break down objective into key components
    const components = objective.split(' AND ');
    return components.every(component => 
      this.validateObjectiveComponent(chapter, component, scene)
    );
  }

  private validateObjectiveComponent(
    chapter: string,
    component: string,
    scene: any
  ): boolean {
    // Check for key phrases and outcomes
    const keyPhrases = component.toLowerCase().split(' OR ');
    return keyPhrases.some(phrase => 
      chapter.toLowerCase().includes(phrase)
    );
  }

  private async findChapterObjective(
    chapter: string,
    objective: string
  ): Promise<boolean> {
    const objectiveElements = objective.split(' AND ');
    return objectiveElements.every(element => 
      this.searchForObjectiveElement(chapter, element)
    );
  }

  private searchForObjectiveElement(chapter: string, element: string): boolean {
    const variations = this.generatePhraseVariations(element);
    return variations.some(variation => 
      chapter.toLowerCase().includes(variation.toLowerCase())
    );
  }

  private generatePhraseVariations(phrase: string): string[] {
    // Generate variations of the phrase to account for different wordings
    const basePhrase = phrase.toLowerCase();
    const variations = [basePhrase];

    // Add passive voice variation
    if (basePhrase.includes(' by ')) {
      variations.push(
        basePhrase.split(' by ').reverse().join(' ')
      );
    }

    // Add synonym variations
    const synonyms = this.getSynonyms(basePhrase);
    variations.push(...synonyms);

    return variations;
  }

  private getSynonyms(phrase: string): string[] {
    // Basic synonym mapping for common story elements
    const synonymMap: { [key: string]: string[] } = {
      'discover': ['find', 'uncover', 'reveal', 'learn'],
      'realize': ['understand', 'comprehend', 'grasp', 'recognize'],
      'fight': ['battle', 'struggle', 'confront', 'face'],
      'help': ['assist', 'aid', 'support', 'rescue'],
      'find': ['locate', 'discover', 'uncover', 'spot']
    };

    const words = phrase.split(' ');
    const variations: string[] = [];

    words.forEach(word => {
      const synonyms = synonymMap[word.toLowerCase()] || [];
      if (synonyms.length > 0) {
        synonyms.forEach(synonym => {
          variations.push(
            phrase.replace(word, synonym)
          );
        });
      }
    });

    return variations;
  }

  private async extractCharacterActions(
    chapter: string,
    character: string
  ): Promise<string[]> {
    const sentences = chapter.split(/[.!?]+/);
    return sentences.filter(sentence => {
      const lowercaseSentence = sentence.toLowerCase();
      const lowercaseCharacter = character.toLowerCase();
      return (
        lowercaseSentence.includes(lowercaseCharacter) &&
        this.containsActionVerb(lowercaseSentence)
      );
    });
  }

  private containsActionVerb(sentence: string): boolean {
    const actionVerbs = [
      'walk', 'run', 'jump', 'speak', 'say', 'look',
      'move', 'take', 'give', 'think', 'feel', 'see'
    ];
    return actionVerbs.some(verb => 
      sentence.includes(verb) || 
      sentence.includes(verb + 's') || 
      sentence.includes(verb + 'ed')
    );
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

  private formatChapterPrompt(prompt: ChapterPrompt): string {
    return `
    Generate a chapter with the following specifications:
    
    Context:
    ${JSON.stringify(prompt.context, null, 2)}
    
    Requirements:
    ${JSON.stringify(prompt.requirements, null, 2)}
    
    Style Guidelines:
    ${JSON.stringify(prompt.style, null, 2)}
    
    Technical Requirements:
    ${JSON.stringify(prompt.technical, null, 2)}
    
    Chapter Outline:
    ${JSON.stringify(prompt.outline, null, 2)}
    
    Please generate the chapter content following these specifications exactly.
    `;
  }

  private async checkWritingStyle(chapter: string): Promise<ValidationResult> {
    const targetStyle = this.context.settings.basicSettings.writingStyle;
    const styleAnalysis = await this.analyzeWritingStyle(chapter);
    
    if (styleAnalysis !== targetStyle) {
      return {
        success: false,
        error: `Writing style mismatch: expected ${targetStyle}, found ${styleAnalysis}`
      };
    }
    
    return { success: true };
  }

  private async analyzeWritingStyle(text: string): Promise<string> {
    // Implement writing style analysis
    // This would use text analysis to determine the dominant writing style
    return '';
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private async analyzePacing(chapter: string): Promise<number> {
    // Implement pacing analysis
    // This would calculate the pacing based on various factors
    return 3;
  }

  private async analyzeDialogueRatio(chapter: string): Promise<number> {
    const dialogueMatches = chapter.match(/["'](?:\\.|[^"'\\])*["']/g) || [];
    const totalWords = this.countWords(chapter);
    const dialogueWords = dialogueMatches.reduce((count, match) => 
      count + this.countWords(match), 0
    );
    
    return dialogueWords / totalWords;
  }
}
