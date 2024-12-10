import { ValidationResult } from '../types';
import { OutlineSection } from '../types/outline';
import { TextAnalyzer } from './TextAnalyzer';

export class ChapterValidator {
  static async validateChapter(
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

  private static async validateContent(
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

  private static async validateStyle(chapter: string): Promise<ValidationResult> {
    try {
      const styleChecks = [
        TextAnalyzer.checkWritingStyle(chapter, 'expectedStyle'),
        TextAnalyzer.checkDialogueStyle(chapter),
        TextAnalyzer.checkDescriptiveStyle(chapter),
        TextAnalyzer.checkVoiceConsistency(chapter)
      ];

      const results = await Promise.all(styleChecks);
      if (results.some(result => !result)) {
        return {
          success: false,
          error: 'Style validation failed'
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

  private static async validateContinuity(chapter: string): Promise<ValidationResult> {
    // Implement continuity validation logic
    return { success: true };
  }

  private static async validateTechnicalRequirements(
    chapter: string,
    outline: OutlineSection
  ): Promise<ValidationResult> {
    // Implement technical requirements validation logic
    return { success: true };
  }

  private static findSceneElements(chapter: string, scene: any): boolean {
    const elements = [
      scene.location,
      scene.conflict,
      ...scene.characters
    ];

    return elements.every(element => 
      chapter.toLowerCase().includes(element.toLowerCase())
    );
  }

  private static findCharacterPresence(
    chapter: string,
    character: string,
    scene: any
  ): boolean {
    // Check for character name mentions
    if (!chapter.toLowerCase().includes(character.toLowerCase())) {
      return false;
    }

    // Check for character actions
    const characterActions = this.extractCharacterActions(chapter, character);
    return characterActions.length > 0;
  }

  private static findObjectiveCompletion(
    chapter: string,
    objective: string,
    scene: any
  ): boolean {
    // Break down objective into key components
    const components = objective.split(' AND ');
    return components.every(component => 
      this.validateObjectiveComponent(chapter, component, scene)
    );
  }

  private static validateObjectiveComponent(
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

  private static findChapterObjective(
    chapter: string,
    objective: string
  ): boolean {
    const objectiveElements = objective.split(' AND ');
    return objectiveElements.every(element => 
      this.searchForObjectiveElement(chapter, element)
    );
  }

  private static searchForObjectiveElement(chapter: string, element: string): boolean {
    const variations = this.generatePhraseVariations(element);
    return variations.some(variation => 
      chapter.toLowerCase().includes(variation.toLowerCase())
    );
  }

  private static generatePhraseVariations(phrase: string): string[] {
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

  private static getSynonyms(phrase: string): string[] {
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

  private static extractCharacterActions(
    chapter: string,
    character: string
  ): string[] {
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

  private static containsActionVerb(sentence: string): boolean {
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
}
