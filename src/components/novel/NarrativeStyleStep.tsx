import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters, POV, StoryStructure, ConflictType, ResolutionStyle } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface NarrativeStyleStepProps {
  form: UseFormReturn<NovelParameters>;
}

const POV_OPTIONS: POV[] = ['first', 'third_limited', 'third_omniscient', 'multiple'];
const STORY_STRUCTURES: StoryStructure[] = [
  "Three-Act Structure",
  "Hero's Journey",
  "Nonlinear",
  "Parallel",
  "Five-Act Structure",
  "Episodic",
  "Circular",
  "Framing Device",
  "In Medias Res"
];
const CONFLICT_TYPES: ConflictType[] = [
  'person_vs_person',
  'person_vs_nature',
  'person_vs_society',
  'person_vs_self',
  'person_vs_technology',
  'person_vs_fate'
];
const RESOLUTION_STYLES: ResolutionStyle[] = [
  'Conclusive',
  'Open-Ended',
  'Twist',
  'Circular',
  'Bittersweet'
];

export function NarrativeStyleStep({ form }: NarrativeStyleStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  const handleConflictTypeChange = (type: ConflictType, checked: boolean) => {
    const currentTypes = values.conflictTypes || [];
    if (checked) {
      setValue('conflictTypes', [...currentTypes, type]);
    } else {
      setValue('conflictTypes', currentTypes.filter(t => t !== type));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Point of View</Label>
        <RadioGroup
          value={values.pov}
          onValueChange={(value) => setValue('pov', value as POV)}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
        >
          {POV_OPTIONS.map((pov) => (
            <div key={pov}>
              <RadioGroupItem value={pov} id={pov} className="peer sr-only" />
              <Label
                htmlFor={pov}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {pov.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Story Structure</Label>
        <RadioGroup
          value={values.storyStructure}
          onValueChange={(value) => setValue('storyStructure', value as StoryStructure)}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
        >
          {STORY_STRUCTURES.map((structure) => (
            <div key={structure}>
              <RadioGroupItem value={structure} id={structure} className="peer sr-only" />
              <Label
                htmlFor={structure}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {structure}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base mb-2 block">Conflict Types (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONFLICT_TYPES.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={values.conflictTypes?.includes(type)}
                onCheckedChange={(checked) => handleConflictTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={type}>
                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base">Resolution Style</Label>
        <RadioGroup
          value={values.resolutionStyle}
          onValueChange={(value) => setValue('resolutionStyle', value as ResolutionStyle)}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
        >
          {RESOLUTION_STYLES.map((style) => (
            <div key={style}>
              <RadioGroupItem value={style} id={style} className="peer sr-only" />
              <Label
                htmlFor={style}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}