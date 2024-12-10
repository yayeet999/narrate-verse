import React from 'react';
import { StorySettings } from '@/types/story';

interface ThematicElementsStepProps {
  settings: StorySettings;
  updateSettings: (settings: StorySettings) => void;
}

export function ThematicElementsStep({ settings, updateSettings }: ThematicElementsStepProps) {
  const coreThemes = [
    'Redemption', 'Love & Loss', 'Good vs Evil',
    'Coming of Age', 'Power & Corruption', 'Identity',
    'Family', 'Survival', 'Justice', 'Freedom'
  ];

  const storyEndings = [
    'Clear Resolution', 'Open Ended', 'Bittersweet',
    'Unexpected Twist', 'Cliffhanger', 'Moral Downfall',
    'Unresolved', 'Happy'
  ];

  const moodAndFeel = [
    'Ironic Despair', 'Subtle Menace', 'Mechanical Coldness',
    'Raging Tranquility', 'Surreal', 'Nostalgic',
    'Bleak', 'Majestic', 'Brooding'
  ];

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Core Themes (Select 2-3)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {coreThemes.map(theme => (
            <button
              key={theme}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.thematicElements.coreThemes.includes(theme)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                const currentThemes = settings.thematicElements.coreThemes;
                let newThemes;
                if (currentThemes.includes(theme)) {
                  newThemes = currentThemes.filter(t => t !== theme);
                } else if (currentThemes.length < 3) {
                  newThemes = [...currentThemes, theme];
                } else {
                  return;
                }
                updateSettings({
                  ...settings,
                  thematicElements: { ...settings.thematicElements, coreThemes: newThemes }
                });
              }}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Ending
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {storyEndings.map(ending => (
            <button
              key={ending}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.thematicElements.storyEnding === ending
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                thematicElements: { ...settings.thematicElements, storyEnding: ending }
              })}
            >
              {ending}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood and Feel (Select multiple)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {moodAndFeel.map(mood => (
            <button
              key={mood}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.thematicElements.moodAndFeel.includes(mood)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                const newMoods = settings.thematicElements.moodAndFeel.includes(mood)
                  ? settings.thematicElements.moodAndFeel.filter(m => m !== mood)
                  : [...settings.thematicElements.moodAndFeel, mood];
                updateSettings({
                  ...settings,
                  thematicElements: { ...settings.thematicElements, moodAndFeel: newMoods }
                });
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
