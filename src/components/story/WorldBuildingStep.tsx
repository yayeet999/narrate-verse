import React from 'react';
import { StorySettings } from '@/types/story';
import { UseFormReturn } from 'react-hook-form';

interface WorldBuildingStepProps {
  form: UseFormReturn<StorySettings>;
}

export function WorldBuildingStep({ form }: WorldBuildingStepProps) {
  const { watch, setValue } = form;
  const settings = watch();

  const worldTypes = [
    'Mythical', 'Futuristic', 'Dystopian', 'Utopian', 'Alternate Reality',
    'Post-apocalyptic', 'Steampunk', 'Cyberpunk', 'Space-faring', 'Virtual World',
    'Prehistoric', 'Medieval', 'Modern', 'Historical', 'Magical',
    'Alien World', 'Underwater', 'Subterranean', 'Multiverse', 'Time Travel'
  ];

  const timePeriods = [
    'Prehistoric', 'Ancient', 'Medieval', 'Renaissance', 'Industrial',
    'Victorian', 'Modern', 'Future', 'Post-apocalyptic', 'Steampunk',
    'Cyberpunk', 'Alternate Reality', 'Time Travel', 'Space-faring', 'Virtual World'
  ];

  const worldViews = [
    'Surreal', 'Realistic', 'Fantastical', 'Grimdark', 'Romantic',
    'Minimalist', 'Ornate', 'Abstract', 'Vibrant', 'Muted',
    'Dark', 'Light', 'Gothic', 'Whimsical', 'Epic',
    'Chaotic', 'Orderly', 'Ethereal', 'Gritty', 'Nostalgic'
  ];

  const updateWorldBuilding = (field: keyof StorySettings['worldBuilding'], value: any) => {
    setValue('worldBuilding', {
      ...settings.worldBuilding,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          World Type
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={settings.worldBuilding?.worldType || ''}
          onChange={(e) => updateWorldBuilding('worldType', e.target.value)}
        >
          <option value="">Select a world type</option>
          {worldTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Period
        </label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={settings.worldBuilding?.timePeriod || ''}
          onChange={(e) => updateWorldBuilding('timePeriod', e.target.value)}
        >
          <option value="">Select a time period</option>
          {timePeriods.map(period => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          World View (Select multiple)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {worldViews.map(view => (
            <button
              key={view}
              type="button"
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.worldBuilding?.worldView.includes(view)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                const newWorldView = settings.worldBuilding?.worldView.includes(view)
                  ? settings.worldBuilding.worldView.filter(v => v !== view)
                  : [...(settings.worldBuilding?.worldView || []), view];
                updateWorldBuilding('worldView', newWorldView);
              }}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setting Detail Level
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.worldBuilding?.settingDetail || 3}
            onChange={(e) => updateWorldBuilding('settingDetail', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Minimal Background</span>
            <span>Immersive World</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Social/Cultural Elements
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.worldBuilding?.socialCulturalElements || 3}
            onChange={(e) => updateWorldBuilding('socialCulturalElements', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Individual Focus</span>
            <span>Deep Social Web</span>
          </div>
        </div>
      </div>
    </div>
  );
}
