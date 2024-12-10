import React from 'react';
import { StorySettings } from '@/types/story';

interface PacingStyleStepProps {
  settings: StorySettings;
  updateSettings: (settings: StorySettings) => void;
}

export function PacingStyleStep({ settings, updateSettings }: PacingStyleStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plot Development Speed
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.pacingStyle.plotDevelopment}
          onChange={(e) => updateSettings({
            ...settings,
            pacingStyle: { ...settings.pacingStyle, plotDevelopment: Number(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Meandering & Contemplative</span>
          <span>Rapid & Intense</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scene Detail Level
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.pacingStyle.sceneDetail}
          onChange={(e) => updateSettings({
            ...settings,
            pacingStyle: { ...settings.pacingStyle, sceneDetail: Number(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
            <span>Minimalist & Sparse</span>
            <span>Highly Descriptive</span>
          </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dialog vs Narrative
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.pacingStyle.dialogNarrative}
          onChange={(e) => updateSettings({
            ...settings,
            pacingStyle: { ...settings.pacingStyle, dialogNarrative: Number(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Narrative Heavy (20% dialog)</span>
          <span>Dialog Driven (60% dialog)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Mood
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.pacingStyle.overallMood}
          onChange={(e) => updateSettings({
            ...settings,
            pacingStyle: { ...settings.pacingStyle, overallMood: Number(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Dark & Brooding</span>
          <span>Bright & Optimistic</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dramatic vs Humorous
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.pacingStyle.dramaticHumorous}
          onChange={(e) => updateSettings({
            ...settings,
            pacingStyle: { ...settings.pacingStyle, dramaticHumorous: Number(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Purely Dramatic</span>
          <span>Primarily Humorous</span>
        </div>
      </div>
    </div>
  );
}
