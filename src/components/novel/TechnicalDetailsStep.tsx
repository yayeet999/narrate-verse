import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface TechnicalDetailsStepProps {
  form: UseFormReturn<NovelParameters>;
}

export function TechnicalDetailsStep({ form }: TechnicalDetailsStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Sentence Structure</Label>
        <RadioGroup
          value={values.sentenceStructure}
          onValueChange={(value) => setValue('sentenceStructure', value as NovelParameters['sentenceStructure'])}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="simple" id="simple" className="peer sr-only" />
            <Label
              htmlFor="simple"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Simple</span>
              <span className="text-sm text-muted-foreground">Clear and direct sentences</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="complex" id="complex" className="peer sr-only" />
            <Label
              htmlFor="complex"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Complex</span>
              <span className="text-sm text-muted-foreground">Sophisticated sentence structures</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Paragraph Length</Label>
        <RadioGroup
          value={values.paragraphLength}
          onValueChange={(value) => setValue('paragraphLength', value as NovelParameters['paragraphLength'])}
          className="grid grid-cols-3 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="short" id="short" className="peer sr-only" />
            <Label
              htmlFor="short"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Short</span>
              <span className="text-sm text-muted-foreground">2-3 sentences</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
            <Label
              htmlFor="medium"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Medium</span>
              <span className="text-sm text-muted-foreground">4-6 sentences</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="long" id="long" className="peer sr-only" />
            <Label
              htmlFor="long"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Long</span>
              <span className="text-sm text-muted-foreground">7+ sentences</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Content Controls</Label>
        <div className="space-y-6 mt-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Violence Level</Label>
              <span className="text-sm text-muted-foreground">{values.violenceLevel}/5</span>
            </div>
            <Slider
              value={[values.violenceLevel]}
              onValueChange={([value]) => setValue('violenceLevel', value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Adult Content Level</Label>
              <span className="text-sm text-muted-foreground">{values.adultContentLevel}/5</span>
            </div>
            <Slider
              value={[values.adultContentLevel]}
              onValueChange={([value]) => setValue('adultContentLevel', value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Profanity Level</Label>
              <span className="text-sm text-muted-foreground">{values.profanityLevel}/5</span>
            </div>
            <Slider
              value={[values.profanityLevel]}
              onValueChange={([value]) => setValue('profanityLevel', value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base">Controversial Content Handling</Label>
        <RadioGroup
          value={values.controversialHandling}
          onValueChange={(value) => setValue('controversialHandling', value as NovelParameters['controversialHandling'])}
          className="grid grid-cols-3 gap-4 mt-2"
        >
          <div>
            <RadioGroupItem value="avoid" id="avoid" className="peer sr-only" />
            <Label
              htmlFor="avoid"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Avoid</span>
              <span className="text-sm text-muted-foreground">Skip controversial topics</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="careful" id="careful" className="peer sr-only" />
            <Label
              htmlFor="careful"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Careful</span>
              <span className="text-sm text-muted-foreground">Handle with sensitivity</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="direct" id="direct" className="peer sr-only" />
            <Label
              htmlFor="direct"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Direct</span>
              <span className="text-sm text-muted-foreground">Address topics directly</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}