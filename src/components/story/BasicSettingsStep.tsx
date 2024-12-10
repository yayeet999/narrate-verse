import React from 'react';
import { StorySettings } from '@/types/story';

interface BasicSettingsStepProps {
  settings: StorySettings;
  updateSettings: (settings: StorySettings) => void;
}

export function BasicSettingsStep({ settings, updateSettings }: BasicSettingsStepProps) {
  const genres = [
    'Fantasy', 'Science Fiction', 'Mystery/Thriller', 'Romance',
    'Historical Fiction', 'Contemporary Fiction', 'Horror',
    'Literary Fiction', 'Adventure', 'Crime'
  ];

  const lengths = [
    { value: '5-10', label: '5-10 pages (2-4 major scenes)' },
    { value: '10-20', label: '10-20 pages (4-8 scenes)' },
    { value: '20-30', label: '20-30 pages (6-12 scenes)' }
  ];

  const writingStyles = [
    'Lyrical/Poetic', 'Minimalist', 'Stream of Consciousness',
    'Journalistic/Documentary', 'Ornate/Baroque', 'Conversational/Casual'
  ];

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Genre
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={settings.basicSettings.genre}
          onChange={(e) => updateSettings({
            ...settings,
            basicSettings: { ...settings.basicSettings, genre: e.target.value }
          })}
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
              className={`p-4 border rounded-lg text-center transition-colors ${
                settings.basicSettings.length === length.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                basicSettings: { ...settings.basicSettings, length: length.value }
              })}
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
              className={`p-4 border rounded-lg text-center transition-colors ${
                settings.basicSettings.writingStyle === style
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                basicSettings: { ...settings.basicSettings, writingStyle: style }
              })}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
