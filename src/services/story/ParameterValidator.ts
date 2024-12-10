import { StorySettings } from '@/types/story';
import { ValidationResult } from './types';

export class ParameterValidator {
  async validate(settings: StorySettings): Promise<ValidationResult> {
    console.log('Validating story settings:', settings);
    
    try {
      // Basic Settings Validation
      if (!settings.basicSettings.genre) {
        return { success: false, error: 'Genre is required' };
      }
      if (!settings.basicSettings.length) {
        return { success: false, error: 'Story length is required' };
      }
      if (!settings.basicSettings.writingStyle) {
        return { success: false, error: 'Writing style is required' };
      }

      // Character Creation Validation
      if (!settings.characterCreation.characterRole) {
        return { success: false, error: 'Character role is required' };
      }
      if (!settings.characterCreation.personalityTraits || settings.characterCreation.personalityTraits.length === 0) {
        return { success: false, error: 'At least one personality trait is required' };
      }

      // Thematic Elements Validation
      if (!settings.thematicElements.coreThemes || settings.thematicElements.coreThemes.length === 0) {
        return { success: false, error: 'At least one core theme is required' };
      }

      console.log('Settings validation successful');
      return { success: true };
    } catch (error) {
      console.error('Settings validation failed:', error);
      return { success: false, error: 'Invalid settings format' };
    }
  }
}