import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface WritingStyleStepProps {
  form: UseFormReturn<NovelParameters>;
}

export function WritingStyleStep({ form }: WritingStyleStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Tone and Style</Label>
        <div className="space-y-6 mt-4">
          <div>
            <Label className="text-sm">Formality Level</Label>
            <div className="mt-2">
              <Slider
                value={[values.toneFormality]}
                onValueChange={([value]) => setValue('toneFormality', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Casual</span>
                <span>Level {values.toneFormality}</span>
                <span>Formal</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Descriptive Detail</Label>
            <div className="mt-2">
              <Slider
                value={[values.toneDescriptive]}
                onValueChange={([value]) => setValue('toneDescriptive', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Minimal</span>
                <span>Level {values.toneDescriptive}</span>
                <span>Elaborate</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Dialogue Balance</Label>
            <div className="mt-2">
              <Slider
                value={[values.dialogueBalance]}
                onValueChange={([value]) => setValue('dialogueBalance', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Sparse</span>
                <span>Level {values.dialogueBalance}</span>
                <span>Frequent</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Description Density</Label>
            <div className="mt-2">
              <Slider
                value={[values.descriptionDensity]}
                onValueChange={([value]) => setValue('descriptionDensity', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Light</span>
                <span>Level {values.descriptionDensity}</span>
                <span>Dense</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Pacing and Flow</Label>
        <div className="space-y-6 mt-4">
          <div>
            <Label className="text-sm">Overall Pacing</Label>
            <div className="mt-2">
              <Slider
                value={[values.pacingOverall]}
                onValueChange={([value]) => setValue('pacingOverall', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Slow</span>
                <span>Level {values.pacingOverall}</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Pacing Variance</Label>
            <div className="mt-2">
              <Slider
                value={[values.pacingVariance]}
                onValueChange={([value]) => setValue('pacingVariance', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Consistent</span>
                <span>Level {values.pacingVariance}</span>
                <span>Variable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Literary Devices</Label>
        <div className="space-y-6 mt-4">
          <div>
            <Label className="text-sm">Emotional Intensity</Label>
            <div className="mt-2">
              <Slider
                value={[values.emotionalIntensity]}
                onValueChange={([value]) => setValue('emotionalIntensity', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Subtle</span>
                <span>Level {values.emotionalIntensity}</span>
                <span>Intense</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Metaphor Usage</Label>
            <div className="mt-2">
              <Slider
                value={[values.metaphorFrequency]}
                onValueChange={([value]) => setValue('metaphorFrequency', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Rare</span>
                <span>Level {values.metaphorFrequency}</span>
                <span>Frequent</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Flashback Usage</Label>
            <div className="mt-2">
              <Slider
                value={[values.flashbackUsage]}
                onValueChange={([value]) => setValue('flashbackUsage', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Minimal</span>
                <span>Level {values.flashbackUsage}</span>
                <span>Extensive</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm">Foreshadowing Intensity</Label>
            <div className="mt-2">
              <Slider
                value={[values.foreshadowingIntensity]}
                onValueChange={([value]) => setValue('foreshadowingIntensity', value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Subtle</span>
                <span>Level {values.foreshadowingIntensity}</span>
                <span>Prominent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}