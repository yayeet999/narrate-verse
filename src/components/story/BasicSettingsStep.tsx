import React from 'react';
import { StorySettings } from '@/types/story';
import { UseFormReturn } from 'react-hook-form';
import { STORY_LENGTHS } from '@/lib/constants/story';

interface BasicSettingsStepProps {
  form: UseFormReturn<StorySettings>;
}

export function BasicSettingsStep({ form }: BasicSettingsStepProps) {
  const { watch, setValue } = form;
  const settings = watch();

  const genres = [
    'Fantasy', 'Science Fiction', 'Mystery/Thriller', 'Romance',
    'Historical Fiction', 'Contemporary Fiction', 'Horror',
    'Literary Fiction', 'Adventure', 'Crime'
  ];

  const lengths = Object.values(STORY_LENGTHS);

  const writingStyles = [
    'Lyrical/Poetic', 'Minimalist', 'Stream of Consciousness',
    'Journalistic/Documentary', 'Ornate/Baroque', 'Conversational/Casual'
  ];

  const updateBasicSettings = (field: keyof StorySettings['basicSettings'], value: string) => {
    setValue('basicSettings', {
      ...settings.basicSettings,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Genre
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={settings.basicSettings?.genre || ''}
          onChange={(e) => updateBasicSettings('genre', e.target.value)}
        >
          <option value="">Select a genre</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Length
        </label>
        <div className="grid grid-cols-3 gap-4">
          {lengths.map(length => (
            <button
              key={length.value}
              type="button"
              className={`p-4 border rounded-lg text-center transition-colors ${
                settings.basicSettings?.length === length.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateBasicSettings('length', length.value)}
            >
              {length.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Writing Style
        </label>
        <div className="grid grid-cols-2 gap-4">
          {writingStyles.map(style => (
            <button
              key={style}
              type="button"
              className={`p-4 border rounded-lg text-center transition-colors ${
                settings.basicSettings?.writingStyle === style
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateBasicSettings('writingStyle', style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}