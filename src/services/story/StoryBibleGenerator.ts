import { StorySettings } from '@/types/story';
import { ProcessedVectorResults, ValidationResult } from './types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface WorldFramework {
  setting: {
    primaryWorld: string;
    timeperiod: string;
    culturalElements: string[];
    physicalEnvironment: {
      description: string;
      landmarks: string[];
      atmosphere: string;
    };
  };
  rules: {
    natural: string[];
    magical?: string[];
    technological?: string[];
    social: string[];
  };
  atmosphere: {
    mood: string;
    thematicElements: string[];
  };
}

interface CharacterFramework {
  mainCharacter: {
    profile: {
      age: number;
      role: string;
      personality: string[];
      background: string;
      goals: string[];
      fears: string[];
    };
    arc: {
      startingPoint: string;
      majorChanges: string[];
      endPoint: string;
      internalConflicts: string[];
    };
    relationships: Map<string, string>;
    voice: {
      speechPatterns: string[];
      internalMonologue: string;
      emotionalExpression: string;
    };
  };
  supportingCharacters: Array<{
    role: string;
    relationship: string;
    arc: string;
    significance: string;
  }>;
  dynamics: {
    conflicts: string[];
    alliances: string[];
    developments: string[];
  };
}

interface PlotFramework {
  structure: {
    mainPlot: {
      hook: string;
      incitingIncident: string;
      risingAction: string[];
      climax: string;
      resolution: string;
    };
    subplots: Array<{
      type: string;
      arc: string[];
      resolution: string;
    }>;
  };
  pacing: {
    overall: number;
    chapterGuidelines: string[];
    tensionPoints: string[];
    breathers: string[];
  };
  themes: {
    primary: string;
    secondary: string[];
    symbolism: string[];
    motifs: string[];
  };
}

interface TechnicalFramework {
  style: {
    voice: string;
    tone: string;
    perspective: string;
    descriptiveStyle: string;
  };
  formatting: {
    dialogueRules: string[];
    sceneTransitions: string[];
    timePassageHandling: string[];
  };
  requirements: {
    chapterLength: {
      min: number;
      max: number;
      target: number;
    };
    sceneStructure: string[];
    pacing: {
      actionToDescription: number;
      dialogueToNarration: number;
    };
  };
}

export interface StoryBible {
  world: WorldFramework;
  characters: CharacterFramework;
  plot: PlotFramework;
  technical: TechnicalFramework;
  metadata: {
    version: string;
    generatedAt: string;
    settings: StorySettings;
  };
}

export class StoryBibleGenerator {
  private settings: StorySettings;
  private vectorResults: ProcessedVectorResults;

  constructor(settings: StorySettings, vectorResults: ProcessedVectorResults) {
    this.settings = settings;
    this.vectorResults = vectorResults;
  }

  async generateStoryBible(): Promise<StoryBible> {
    try {
      const worldFramework = await this.generateWorldFramework();
      const characterFramework = await this.generateCharacterFramework();
      const plotFramework = await this.generatePlotFramework();
      const technicalFramework = await this.generateTechnicalFramework();

      const storyBible = {
        world: worldFramework,
        characters: characterFramework,
        plot: plotFramework,
        technical: technicalFramework,
        metadata: {
          version: '1.0',
          generatedAt: new Date().toISOString(),
          settings: this.settings
        }
      };

      const validationResult = await this.validateStoryBible(storyBible);
      if (!validationResult.success) {
        throw new Error(`Story Bible validation failed: ${validationResult.error}`);
      }

      return storyBible;
    } catch (error) {
      throw new Error(`Failed to generate Story Bible: ${error.message}`);
    }
  }

  private async generateWorldFramework(): Promise<WorldFramework> {
    const relevantChunks = this.vectorResults.genreGuides.filter(
      chunk => chunk.relevanceScore >= 0.8
    ).map(chunk => chunk.content).join('\n');

    const worldPrompt = `
    Create a detailed world framework for a ${this.settings.basicSettings.genre} story with:
    World Type: ${this.settings.worldBuilding.worldType}
    Time Period: ${this.settings.worldBuilding.timePeriod}
    Cultural Depth: ${this.settings.worldBuilding.socialCulturalElements}/5
    Setting Detail: ${this.settings.worldBuilding.settingDetail}/5
    
    Using these genre guidelines:
    ${relevantChunks}
    
    Format the response as a detailed world framework including setting details, world rules, and atmosphere.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a world-building expert specializing in creating detailed story settings." },
        { role: "user", content: worldPrompt }
      ],
      temperature: 0.7
    });

    const worldData = JSON.parse(completion.choices[0].message.content);
    
    const framework: WorldFramework = {
      setting: {
        primaryWorld: this.settings.worldBuilding.worldType,
        timeperiod: this.settings.worldBuilding.timePeriod,
        culturalElements: worldData.culturalElements,
        physicalEnvironment: {
          description: worldData.environmentDescription,
          landmarks: worldData.landmarks,
          atmosphere: worldData.atmosphere
        }
      },
      rules: {
        natural: worldData.naturalLaws,
        social: worldData.socialStructures
      },
      atmosphere: {
        mood: this.determineMood(),
        thematicElements: this.settings.thematicElements.coreThemes
      }
    };

    if (this.shouldHaveMagicalSystem()) {
      framework.rules.magical = worldData.magicalSystem;
    }
    if (this.shouldHaveTechnology()) {
      framework.rules.technological = worldData.technologicalSystem;
    }

    return framework;
  }

  private async generateCharacterFramework(): Promise<CharacterFramework> {
    const characterDetails = this.settings.characterCreation;
    const relevantChunks = this.vectorResults.characterGuides;

    const characterPrompt = `
    Create a character framework for a ${this.settings.basicSettings.genre} story's protagonist:
    Age Range: ${characterDetails.ageRange}
    Role: ${characterDetails.characterRole}
    Personality Traits: ${characterDetails.personalityTraits.join(', ')}
    Core Drive: ${characterDetails.coreDrive}
    Moral Alignment: ${characterDetails.moralAlignment}
    
    Include complete character arc, relationships, and voice characteristics.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a character development expert specializing in creating detailed character frameworks." },
        { role: "user", content: characterPrompt }
      ],
      temperature: 0.7
    });

    const characterData = JSON.parse(completion.choices[0].message.content);

    return {
      mainCharacter: {
        profile: {
          age: this.extractAgeFromRange(characterDetails.ageRange),
          role: characterDetails.characterRole,
          personality: characterDetails.personalityTraits,
          background: characterData.background,
          goals: characterData.goals,
          fears: characterData.fears
        },
        arc: characterData.arc,
        relationships: new Map(Object.entries(characterData.relationships)),
        voice: characterData.voice
      },
      supportingCharacters: this.generateSupportingCharacters(characterData.mainCharacter),
      dynamics: {
        conflicts: characterData.dynamics.conflicts,
        alliances: characterData.dynamics.alliances,
        developments: characterData.dynamics.developments
      }
    };
  }

  private async generatePlotFramework(): Promise<PlotFramework> {
    const plotGuides = this.vectorResults.plotStructures;
    const storyLength = this.settings.basicSettings.length;
    const pacing = this.settings.pacingStyle.plotDevelopment;

    const plotPrompt = `
    Create a plot framework for a ${this.settings.basicSettings.genre} story of length ${storyLength} with:
    Pacing: ${pacing}/5
    Core Themes: ${this.settings.thematicElements.coreThemes.join(', ')}
    Ending Type: ${this.settings.thematicElements.storyEnding}
    
    Include complete plot structure, pacing guidelines, and thematic elements.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a plot structure expert specializing in creating detailed story frameworks." },
        { role: "user", content: plotPrompt }
      ],
      temperature: 0.7
    });

    const plotData = JSON.parse(completion.choices[0].message.content);

    return {
      structure: {
        mainPlot: plotData.mainPlot,
        subplots: plotData.subplots
      },
      pacing: {
        overall: pacing,
        chapterGuidelines: plotData.chapterGuidelines,
        tensionPoints: plotData.tensionPoints,
        breathers: plotData.breathers
      },
      themes: {
        primary: this.settings.thematicElements.coreThemes[0],
        secondary: this.settings.thematicElements.coreThemes.slice(1),
        symbolism: plotData.symbolism,
        motifs: plotData.motifs
      }
    };
  }

  private async generateTechnicalFramework(): Promise<TechnicalFramework> {
    const writingStyle = this.settings.basicSettings.writingStyle;
    const dialogueRatio = this.settings.pacingStyle.dialogNarrative;
    const sceneDetail = this.settings.pacingStyle.sceneDetail;

    const technicalPrompt = `
    Create technical guidelines for a ${this.settings.basicSettings.genre} story with:
    Writing Style: ${writingStyle}
    Dialogue-to-Narrative Ratio: ${dialogueRatio}/5
    Scene Detail Level: ${sceneDetail}/5
    
    Include complete style guide, formatting rules, and technical requirements.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a technical writing expert specializing in creating detailed writing guidelines." },
        { role: "user", content: technicalPrompt }
      ],
      temperature: 0.7
    });

    const technicalData = JSON.parse(completion.choices[0].message.content);

    return {
      style: {
        voice: writingStyle,
        tone: this.settings.pacingStyle.overallMood.toString(),
        perspective: technicalData.perspective,
        descriptiveStyle: technicalData.descriptiveStyle
      },
      formatting: technicalData.formatting,
      requirements: {
        chapterLength: this.determineChapterLength(),
        sceneStructure: technicalData.sceneStructure,
        pacing: {
          actionToDescription: technicalData.pacing.actionToDescription,
          dialogueToNarration: dialogueRatio / 5
        }
      }
    };
  }

  private shouldHaveMagicalSystem(): boolean {
    const magicalWorldTypes = ['Fantasy', 'Mythical', 'Magical'];
    return magicalWorldTypes.includes(this.settings.worldBuilding.worldType);
  }

  private shouldHaveTechnology(): boolean {
    const techWorldTypes = ['Science Fiction', 'Cyberpunk', 'Futuristic', 'Modern'];
    return techWorldTypes.includes(this.settings.worldBuilding.worldType);
  }

  private determineMood(): string {
    const moodMap = {
      1: 'Dark & Brooding',
      2: 'Serious & Heavy',
      3: 'Balanced',
      4: 'Light & Uplifting',
      5: 'Bright & Optimistic'
    };
    return moodMap[this.settings.pacingStyle.overallMood as keyof typeof moodMap] || 'Balanced';
  }

  private extractAgeFromRange(range: string): number {
    const ageRanges = {
      'Child (8-12)': 10,
      'Teen (13-17)': 15,
      'Young Adult (18-25)': 22,
      'Adult (26-45)': 35,
      'Middle Aged (46-65)': 55,
      'Senior (65+)': 70
    };
    return ageRanges[range as keyof typeof ageRanges] || 30;
  }

  private generateSupportingCharacters(mainCharacter: any): CharacterFramework['supportingCharacters'] {
    const numSupportingCharacters = Math.min(3, Math.ceil(this.settings.worldBuilding.socialCulturalElements / 2));
    
    return Array.from({ length: numSupportingCharacters }, (_, index) => ({
      role: `Supporting Character ${index + 1}`,
      relationship: this.determineRelationship(index),
      arc: this.generateSupportingCharacterArc(index),
      significance: this.determineSupportingCharacterSignificance(index)
    }));
  }

  private determineRelationship(characterIndex: number): string {
    const relationships = ['Ally', 'Rival', 'Mentor', 'Family', 'Friend'];
    return relationships[characterIndex % relationships.length];
  }

  private generateSupportingCharacterArc(characterIndex: number): string {
    const arcs = [
      'Redemption journey parallel to protagonist',
      'Opposition turning to alliance',
      'Gradual reveal of hidden depths',
      'Personal growth inspired by protagonist',
      'Sacrifice for greater good'
    ];
    return arcs[characterIndex % arcs.length];
  }

  private determineSupportingCharacterSignificance(characterIndex: number): string {
    const significances = [
      'Critical to main plot resolution',
      'Provides essential skills/knowledge',
      'Emotional support/contrast',
      'Represents thematic conflict',
      'Drives subplot development'
    ];
    return significances[characterIndex % significances.length];
  }

  private determineChapterLength(): { min: number; max: number; target: number } {
    const lengthMap = {
      '5-10': { min: 1000, max: 2000, target: 1500 },
      '10-20': { min: 2000, max: 4000, target: 3000 },
      '20-30': { min: 3000, max: 6000, target: 4500 }
    };
    return lengthMap[this.settings.basicSettings.length as keyof typeof lengthMap] || 
           { min: 2000, max: 4000, target: 3000 };
  }

  private async validateStoryBible(storyBible: StoryBible): Promise<ValidationResult> {
    const validations: Promise<ValidationResult>[] = [
      this.validateWorldConsistency(storyBible.world),
      this.validateCharacterConsistency(storyBible.characters),
      this.validatePlotStructure(storyBible.plot),
      this.validateTechnicalRequirements(storyBible.technical)
    ];

    const results = await Promise.all(validations);
    const failures = results.filter(result => !result.success);

    if (failures.length > 0) {
      return {
        success: false,
        error: failures.map(f => f.error).join(', ')
      };
    }

    const crossValidations = await Promise.all([
      this.validateWorldCharacterConsistency(storyBible.world, storyBible.characters),
      this.validatePlotThemeConsistency(storyBible.plot, storyBible.world.atmosphere.thematicElements),
      this.validateTechnicalStyleConsistency(storyBible.technical, storyBible.plot.pacing)
    ]);

    const crossFailures = crossValidations.filter(result => !result.success);

    if (crossFailures.length > 0) {
      return {
        success: false,
        error: crossFailures.map(f => f.error).join(', ')
      };
    }

    return { success: true };
  }

  private async validateWorldConsistency(world: WorldFramework): Promise<ValidationResult> {
    if (!world.setting.primaryWorld || !world.setting.timeperiod) {
      return {
        success: false,
        error: 'Missing core world settings'
      };
    }

    const minCulturalElements = Math.ceil(this.settings.worldBuilding.settingDetail * 2);
    if (world.setting.culturalElements.length < minCulturalElements) {
      return {
        success: false,
        error: `Insufficient cultural elements for detail level ${this.settings.worldBuilding.settingDetail}`
      };
    }

    const requiresMagic = this.shouldHaveMagicalSystem();
    const requiresTech = this.shouldHaveTechnology();

    if (requiresMagic && !world.rules.magical) {
      return {
        success: false,
        error: 'Missing magical system for magical world type'
      };
    }

    if (requiresTech && !world.rules.technological) {
      return {
        success: false,
        error: 'Missing technological system for tech-based world type'
      };
    }

    return { success: true };
  }

  private async validateCharacterConsistency(characters: CharacterFramework): Promise<ValidationResult> {
    if (!characters.mainCharacter.profile.role || characters.mainCharacter.profile.personality.length === 0) {
      return {
        success: false,
        error: 'Incomplete main character profile'
      };
    }

    if (!characters.mainCharacter.arc.startingPoint || !characters.mainCharacter.arc.endPoint) {
      return {
        success: false,
        error: 'Incomplete character arc'
      };
    }

    const relationships = characters.mainCharacter.relationships;
    const supportingCharacters = characters.supportingCharacters;
    
    for (const suppChar of supportingCharacters) {
      if (!relationships.has(suppChar.role)) {
        return {
          success: false,
          error: `Missing relationship definition for ${suppChar.role}`
        };
      }
    }

    if (characters.dynamics.conflicts.length === 0 || characters.dynamics.alliances.length === 0) {
      return {
        success: false,
        error: 'Missing character dynamics'
      };
    }

    return { success: true };
  }

  private async validatePlotStructure(plot: PlotFramework): Promise<ValidationResult> {
    if (!plot.structure.mainPlot.hook || !plot.structure.mainPlot.incitingIncident) {
      return {
        success: false,
        error: 'Incomplete main plot structure'
      };
    }

    if (plot.structure.mainPlot.risingAction.length < 3) {
      return {
        success: false,
        error: 'Insufficient rising action points'
      };
    }

    if (plot.pacing.tensionPoints.length === 0 || plot.pacing.breathers.length === 0) {
      return {
        success: false,
        error: 'Incomplete pacing structure'
      };
    }

    if (!plot.themes.primary || plot.themes.secondary.length === 0) {
      return {
        success: false,
        error: 'Insufficient thematic development'
      };
    }

    return { success: true };
  }

  private async validateTechnicalRequirements(technical: TechnicalFramework): Promise<ValidationResult> {
    if (!technical.style.voice || !technical.style.tone) {
      return {
        success: false,
        error: 'Incomplete style definition'
      };
    }

    if (technical.formatting.dialogueRules.length === 0 || 
        technical.formatting.sceneTransitions.length === 0) {
      return {
        success: false,
        error: 'Missing formatting rules'
      };
    }

    const { actionToDescription, dialogueToNarration } = technical.requirements.pacing;
    if (actionToDescription < 0 || actionToDescription > 1 ||
        dialogueToNarration < 0 || dialogueToNarration > 1) {
      return {
        success: false,
        error: 'Invalid pacing ratios'
      };
    }

    const { min, max, target } = technical.requirements.chapterLength;
    if (min >= max || target < min || target > max) {
      return {
        success: false,
        error: 'Invalid chapter length requirements'
      };
    }

    return { success: true };
  }

  private async validateWorldCharacterConsistency(
    world: WorldFramework,
    characters: CharacterFramework
  ): Promise<ValidationResult> {
    if (!this.characterBackgroundsMatchWorld(world, characters)) {
      return {
        success: false,
        error: 'Character backgrounds inconsistent with world setting'
      };
    }

    if (!this.socialStructuresMatchRelationships(world.rules.social, characters.dynamics)) {
      return {
        success: false,
        error: 'Character relationships inconsistent with world social structures'
      };
    }

    return { success: true };
  }

  private async validatePlotThemeConsistency(
    plot: PlotFramework,
    thematicElements: string[]
  ): Promise<ValidationResult> {
    for (const theme of thematicElements) {
      if (!this.themeReflectedInPlot(theme, plot)) {
        return {
          success: false,
          error: `Theme "${theme}" not sufficiently reflected in plot`
        };
      }
    }

    return { success: true };
  }

  private async validateTechnicalStyleConsistency(
    technical: TechnicalFramework,
    pacing: PlotFramework['pacing']
  ): Promise<ValidationResult> {
    if (!this.technicalRequirementsSupportPacing(technical, pacing)) {
      return {
        success: false,
        error: 'Technical requirements do not support planned pacing'
      };
    }

    return { success: true };
  }

  private characterBackgroundsMatchWorld(
    world: WorldFramework,
    characters: CharacterFramework
  ): boolean {
    return true; // Implement detailed character-world consistency check
  }

  private socialStructuresMatchRelationships(
    socialStructures: string[],
    dynamics: CharacterFramework['dynamics']
  ): boolean {
    return true; // Implement social structure consistency check
  }

  private themeReflectedInPlot(theme: string, plot: PlotFramework): boolean {
    return true; // Implement theme reflection analysis
  }

  private technicalRequirementsSupportPacing(
    technical: TechnicalFramework,
    pacing: PlotFramework['pacing']
  ): boolean {
    return true; // Implement technical-pacing compatibility check
  }
}
