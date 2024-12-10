import React from 'react';
import { StorySettings } from '@/types/story';

interface CharacterCreationStepProps {
  settings: StorySettings;
  updateSettings: (settings: StorySettings) => void;
}

export function CharacterCreationStep({ settings, updateSettings }: CharacterCreationStepProps) {
  const ageRanges = [
    'Child (8-12)', 'Teen (13-17)', 'Young Adult (18-25)',
    'Adult (26-45)', 'Middle Aged (46-65)', 'Senior (65+)'
  ];

  const characterRoles = [
    'Minor Character', 'Supporting Character',
    'Main Antagonist', 'Main Protagonist'
  ];

  const personalityTraits = [
    'Ambitious', 'Cautious', 'Creative', 'Determined',
    'Emotional', 'Logical', 'Rebellious', 'Traditional',
    'Introspective', 'Outgoing'
  ];

  const coreDrives = [
    'Achievement', 'Connection', 'Discovery', 'Justice',
    'Power', 'Survival', 'Redemption', 'Love',
    'Truth', 'Freedom'
  ];

  const moralAlignments = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ];

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age Range
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ageRanges.map(age => (
            <button
              key={age}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.characterCreation.ageRange === age
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                characterCreation: { ...settings.characterCreation, ageRange: age }
              })}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Character Role
        </label>
        <div className="grid grid-cols-2 gap-2">
          {characterRoles.map(role => (
            <button
              key={role}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.characterCreation.characterRole === role
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                characterCreation: { ...settings.characterCreation, characterRole: role }
              })}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personality Traits (Select up to 3)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {personalityTraits.map(trait => (
            <button
              key={trait}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.characterCreation.personalityTraits.includes(trait)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                const currentTraits = settings.characterCreation.personalityTraits;
                let newTraits;
                if (currentTraits.includes(trait)) {
                  newTraits = currentTraits.filter(t => t !== trait);
                } else if (currentTraits.length < 3) {
                  newTraits = [...currentTraits, trait];
                } else {
                  return;
                }
                updateSettings({
                  ...settings,
                  characterCreation: { ...settings.characterCreation, personalityTraits: newTraits }
                });
              }}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Core Drive
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {coreDrives.map(drive => (
            <button
              key={drive}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.characterCreation.coreDrive === drive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                characterCreation: { ...settings.characterCreation, coreDrive: drive }
              })}
            >
              {drive}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moral Alignment
        </label>
        <div className="grid grid-cols-3 gap-2">
          {moralAlignments.map(alignment => (
            <button
              key={alignment}
              className={`p-2 border rounded-md text-sm transition-colors ${
                settings.characterCreation.moralAlignment === alignment
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({
                ...settings,
                characterCreation: { ...settings.characterCreation, moralAlignment: alignment }
              })}
            >
              {alignment}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.characterCreation.confidence}
            onChange={(e) => updateSettings({
              ...settings,
              characterCreation: { ...settings.characterCreation, confidence: Number(e.target.value) }
            })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Very Insecure</span>
            <span>Highly Confident</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decision-Making
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.characterCreation.decisionMaking}
            onChange={(e) => updateSettings({
              ...settings,
              characterCreation: { ...settings.characterCreation, decisionMaking: Number(e.target.value) }
            })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Indecisive</span>
            <span>Impulsive Choices</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Predictability
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.characterCreation.predictability}
            onChange={(e) => updateSettings({
              ...settings,
              characterCreation: { ...settings.characterCreation, predictability: Number(e.target.value) }
            })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Chaotic</span>
            <span>Highly Predictable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
