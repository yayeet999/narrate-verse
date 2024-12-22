import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters, SettingType, CulturalFramework } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface SettingWorldStepProps {
  form: UseFormReturn<NovelParameters>;
}

const SETTING_TYPES: SettingType[] = [
  'Fantasy', 'Urban', 'Historical', 'Futuristic',
  'Contemporary', 'Post-Apocalyptic', 'Space', 'Rural'
];

const CULTURAL_FRAMEWORKS: CulturalFramework[] = [
  'Western', 'Eastern', 'African', 'Middle Eastern',
  'Latin American', 'Nordic', 'Mediterranean', 'Indigenous', 'Multicultural'
];

export function SettingWorldStep({ form }: SettingWorldStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Setting Type</Label>
        <RadioGroup
          value={values.settingType}
          onValueChange={(value) => setValue('settingType', value as SettingType)}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
        >
          {SETTING_TYPES.map((type) => (
            <div key={type}>
              <RadioGroupItem value={type} id={type} className="peer sr-only" />
              <Label
                htmlFor={type}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>{type}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">World Complexity</Label>
        <div className="mt-2">
          <Slider
            value={[values.worldComplexity]}
            onValueChange={([value]) => setValue('worldComplexity', value)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Simple</span>
            <span>Level {values.worldComplexity}</span>
            <span>Complex</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Cultural Depth</Label>
        <div className="mt-2">
          <Slider
            value={[values.culturalDepth]}
            onValueChange={([value]) => setValue('culturalDepth', value)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Surface Level</span>
            <span>Level {values.culturalDepth}</span>
            <span>Deep Integration</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Cultural Framework</Label>
        <RadioGroup
          value={values.culturalFramework}
          onValueChange={(value) => setValue('culturalFramework', value as CulturalFramework)}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
        >
          {CULTURAL_FRAMEWORKS.map((framework) => (
            <div key={framework}>
              <RadioGroupItem value={framework} id={framework} className="peer sr-only" />
              <Label
                htmlFor={framework}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>{framework}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}