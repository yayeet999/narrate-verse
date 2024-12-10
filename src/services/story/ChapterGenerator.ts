import { StoryBible } from './StoryBibleGenerator';
import { OutlineSection } from './types/outline';
import { StorySettings } from '@/types/story';
import { ChapterSummary, ChapterPair, ChapterPrompt } from './types/chapter';
import { TextAnalyzer } from './utils/TextAnalyzer';
import { ChapterValidator } from './utils/ChapterValidator';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface GenerationContext {
  storyBible: StoryBible;
  settings: StorySettings;
  outline: OutlineSection[];
  previousSummaries: ChapterSummary[];
  currentChapterIndex: number;
}

export class ChapterGenerator {
  private context: GenerationContext;
  private retryAttempts = 3;
  private retryDelay = 1000;
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
      const firstChapterOutline = this.context.outline[this.context.currentChapterIndex];
      const secondChapterOutline = this.context.outline[this.context.currentChapterIndex + 1];

      if (!firstChapterOutline) {
        throw new Error('No more chapters to generate');
      }

      const firstChapterPrompt = await this.buildChapterPrompt(firstChapterOutline);
      const firstChapter = await this.retryOperation(
        () => this.generateChapter(firstChapterPrompt),
        'First chapter generation failed'
      );

      await ChapterValidator.validateChapter(firstChapter, firstChapterOutline);
      const firstChapterSummary = await this.generateChapterSummary(firstChapter, firstChapterOutline);

      this.context.previousSummaries.push(firstChapterSummary);

      let secondChapter = null;
      let secondChapterSummary = null;

      if (secondChapterOutline) {
        const secondChapterPrompt = await this.buildChapterPrompt(secondChapterOutline);
        secondChapter = await this.retryOperation(
          () => this.generateChapter(secondChapterPrompt),
          'Second chapter generation failed'
        );

        await ChapterValidator.validateChapter(secondChapter, secondChapterOutline);
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
          summary: secondChapterSummary
        } : null
      };

    } catch (error) {
      throw new Error(`Chapter pair generation failed: ${error.message}`);
    }
  }

  private async generateChapterSummary(
    chapter: string,
    outline: OutlineSection
  ): Promise<ChapterSummary> {
    const summaryPrompt = `
      Analyze the following chapter and provide a summary including:
      - Key events
      - Character developments
      - Plot progress
      - Thematic developments

      Chapter content:
      ${chapter}

      Chapter outline:
      ${JSON.stringify(outline)}
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a literary analyst specializing in story summarization.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.3
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        chapterNumber: outline.chapterNumber,
        keyEvents: analysis.keyEvents,
        characterDevelopments: new Map(Object.entries(analysis.characterDevelopments)),
        plotProgress: analysis.plotProgress,
        thematicDevelopments: analysis.thematicDevelopments
      };
    } catch (error) {
      console.error('Failed to generate chapter summary:', error);
      return {
        chapterNumber: outline.chapterNumber,
        keyEvents: [],
        characterDevelopments: new Map(),
        plotProgress: '',
        thematicDevelopments: []
      };
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
      dialogueRatio: this.context.settings.pacingStyle.dialogNarrative / 5,
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
    const mainChar = this.context.storyBible.characters.mainCharacter;
    const mainCharProgress = this.calculateCharacterProgress('protagonist');
    states.set('protagonist', mainCharProgress);

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
    const plotPoints = [
      mainPlot.hook,
      mainPlot.incitingIncident,
      ...mainPlot.risingAction,
      mainPlot.climax,
      mainPlot.resolution
    ];

    const completedPlotPoints = plotPoints.filter(point => 
      completedEvents.some(event => event.includes(point))
    );

    const progress = completedPlotPoints.length / plotPoints.length;
    return `${Math.round(progress * 100)}% complete`;
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
    return outline.objectives;
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
      1: 1.2,
      2: 1.1,
      3: 1.0,
      4: 0.9,
      5: 0.8
    }[this.context.settings.pacingStyle.plotDevelopment] || 1.0;

    return Math.floor(baseCount * paceMultiplier);
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
}