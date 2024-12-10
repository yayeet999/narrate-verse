import React from 'react';
import { StorySettings } from '@/types/story';

interface ReviewSettingsStepProps {
  settings: StorySettings;
}

export function ReviewSettingsStep({ settings }: ReviewSettingsStepProps) {
  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="border-b border-gray-200 py-4">
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <div className="text-sm text-gray-600">{content}</div>
    </div>
  );

  const renderList = (items: string[]) => {
    if (!items || items.length === 0) return "None selected";
    return items.join(", ");
  };

  const renderScale = (value: number, labels: string[]) => {
    if (!value) return "Not set";
    return `${value}/5 (${labels[value - 1]})`;
  };

  const moodLabels = [
    "Dark & Brooding",
    "Serious & Heavy",
    "Balanced Tone",
    "Light & Uplifting",
    "Bright & Optimistic"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Review Your Story Settings</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {renderSection("Basic Settings", (
          <div className="space-y-2">
            <p><span className="font-medium">Genre:</span> {settings.basicSettings.genre || "Not selected"}</p>
            <p><span className="font-medium">Length:</span> {settings.basicSettings.length || "Not selected"}</p>
            <p><span className="font-medium">Writing Style:</span> {settings.basicSettings.writingStyle || "Not selected"}</p>
          </div>
        ))}

        {renderSection("World Building", (
          <div className="space-y-2">
            <p><span className="font-medium">World Type:</span> {settings.worldBuilding.worldType || "Not selected"}</p>
            <p><span className="font-medium">Time Period:</span> {settings.worldBuilding.timePeriod || "Not selected"}</p>
            <p><span className="font-medium">World View:</span> {renderList(settings.worldBuilding.worldView)}</p>
            <p><span className="font-medium">Setting Detail:</span> {settings.worldBuilding.settingDetail}/5</p>
            <p><span className="font-medium">Social/Cultural Elements:</span> {settings.worldBuilding.socialCulturalElements}/5</p>
          </div>
        ))}

        {renderSection("Pacing & Style", (
          <div className="space-y-2">
            <p><span className="font-medium">Plot Development:</span> {settings.pacingStyle.plotDevelopment}/5</p>
            <p><span className="font-medium">Scene Detail:</span> {settings.pacingStyle.sceneDetail}/5</p>
            <p><span className="font-medium">Dialog vs Narrative:</span> {settings.pacingStyle.dialogNarrative}/5</p>
            <p><span className="font-medium">Overall Mood:</span> {renderScale(settings.pacingStyle.overallMood, moodLabels)}</p>
            <p><span className="font-medium">Dramatic vs Humorous:</span> {settings.pacingStyle.dramaticHumorous}/5</p>
          </div>
        ))}

        {renderSection("Character Creation", (
          <div className="space-y-2">
            <p><span className="font-medium">Age Range:</span> {settings.characterCreation.ageRange || "Not selected"}</p>
            <p><span className="font-medium">Role:</span> {settings.characterCreation.characterRole || "Not selected"}</p>
            <p><span className="font-medium">Personality Traits:</span> {renderList(settings.characterCreation.personalityTraits)}</p>
            <p><span className="font-medium">Core Drive:</span> {settings.characterCreation.coreDrive || "Not selected"}</p>
            <p><span className="font-medium">Moral Alignment:</span> {settings.characterCreation.moralAlignment || "Not selected"}</p>
            <p><span className="font-medium">Confidence:</span> {settings.characterCreation.confidence}/5</p>
            <p><span className="font-medium">Decision-Making:</span> {settings.characterCreation.decisionMaking}/5</p>
            <p><span className="font-medium">Predictability:</span> {settings.characterCreation.predictability}/5</p>
          </div>
        ))}

        {renderSection("Thematic Elements", (
          <div className="space-y-2">
            <p><span className="font-medium">Core Themes:</span> {renderList(settings.thematicElements.coreThemes)}</p>
            <p><span className="font-medium">Story Ending:</span> {settings.thematicElements.storyEnding || "Not selected"}</p>
            <p><span className="font-medium">Mood and Feel:</span> {renderList(settings.thematicElements.moodAndFeel)}</p>
          </div>
        ))}

        {settings.customInstructions && renderSection("Custom Instructions", (
          <div className="whitespace-pre-wrap">
            {settings.customInstructions}
          </div>
        ))}
      </div>
    </div>
  );
}
