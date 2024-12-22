import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { STORY_LENGTHS } from '@/lib/constants/story';

interface CoreStructureStepProps {
  form: UseFormReturn<NovelParameters>;
}

export function CoreStructureStep({ form }: CoreStructureStepProps) {
  const { register, watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Novel Title</Label>
        <Input
          {...register('title')}
          placeholder="Enter your novel's title"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base">Novel Length</Label>
        <RadioGroup
          value={values.novelLength}
          onValueChange={(value) => setValue('novelLength', value as NovelParameters['novelLength'])}
          className="grid grid-cols-3 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="50k-100k" id="50k-100k" className="peer sr-only" />
            <Label
              htmlFor="50k-100k"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>50-100k words</span>
              <span className="text-sm text-muted-foreground">Standard Novel</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="100k-150k" id="100k-150k" className="peer sr-only" />
            <Label
              htmlFor="100k-150k"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>100-150k words</span>
              <span className="text-sm text-muted-foreground">Long Novel</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="150k+" id="150k+" className="peer sr-only" />
            <Label
              htmlFor="150k+"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>150k+ words</span>
              <span className="text-sm text-muted-foreground">Epic Length</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Chapter Structure</Label>
        <RadioGroup
          value={values.chapterStructure}
          onValueChange={(value) => setValue('chapterStructure', value as NovelParameters['chapterStructure'])}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="fixed" id="fixed" className="peer sr-only" />
            <Label
              htmlFor="fixed"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Fixed Length</span>
              <span className="text-sm text-muted-foreground">Consistent chapter sizes</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="variable" id="variable" className="peer sr-only" />
            <Label
              htmlFor="variable"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Variable Length</span>
              <span className="text-sm text-muted-foreground">Natural chapter breaks</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Average Chapter Length</Label>
        <div className="mt-2">
          <Slider
            value={[values.averageChapterLength]}
            onValueChange={([value]) => setValue('averageChapterLength', value)}
            min={1500}
            max={5000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>1,500 words</span>
            <span>{values.averageChapterLength} words</span>
            <span>5,000 words</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Chapter Naming Style</Label>
        <RadioGroup
          value={values.chapterNamingStyle}
          onValueChange={(value) => setValue('chapterNamingStyle', value as NovelParameters['chapterNamingStyle'])}
          className="grid grid-cols-3 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="numbered" id="numbered" className="peer sr-only" />
            <Label
              htmlFor="numbered"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Numbered</span>
              <span className="text-sm text-muted-foreground">Chapter 1, 2, 3...</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="titled" id="titled" className="peer sr-only" />
            <Label
              htmlFor="titled"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Titled</span>
              <span className="text-sm text-muted-foreground">Named chapters</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="both" id="both" className="peer sr-only" />
            <Label
              htmlFor="both"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Both</span>
              <span className="text-sm text-muted-foreground">Number & Title</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}