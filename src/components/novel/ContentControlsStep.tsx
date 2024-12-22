import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContentControlsStepProps {
  form: UseFormReturn<NovelParameters>;
}

export function ContentControlsStep({ form }: ContentControlsStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label>Violence Level</Label>
        <div className="mt-2">
          <Slider
            value={[values.violenceLevel]}
            onValueChange={([value]) => setValue('violenceLevel', value)}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>None</span>
            <span>Mild</span>
            <span>Moderate</span>
            <span>Strong</span>
            <span>Extreme</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Adult Content Level</Label>
        <div className="mt-2">
          <Slider
            value={[values.adultContentLevel]}
            onValueChange={([value]) => setValue('adultContentLevel', value)}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>None</span>
            <span>Mild</span>
            <span>Moderate</span>
            <span>Strong</span>
            <span>Explicit</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Profanity Level</Label>
        <div className="mt-2">
          <Slider
            value={[values.profanityLevel]}
            onValueChange={([value]) => setValue('profanityLevel', value)}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>None</span>
            <span>Mild</span>
            <span>Moderate</span>
            <span>Strong</span>
            <span>Extreme</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Controversial Content Handling</Label>
        <Select
          value={values.controversialHandling}
          onValueChange={(value) => setValue('controversialHandling', value as any)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="avoid">Avoid Entirely</SelectItem>
            <SelectItem value="careful">Handle with Care</SelectItem>
            <SelectItem value="direct">Address Directly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}