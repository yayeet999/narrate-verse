import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NOVEL_LENGTHS } from '@/lib/constants';

interface CoreStructureStepProps {
  form: UseFormReturn<NovelParameters>;
}

export function CoreStructureStep({ form }: CoreStructureStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Novel Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => setValue('title', e.target.value)}
          className="mt-2"
          placeholder="Enter your novel's title"
        />
      </div>

      <div>
        <Label htmlFor="storyDescription">Story Description</Label>
        <Textarea
          id="storyDescription"
          value={values.storyDescription}
          onChange={(e) => setValue('storyDescription', e.target.value)}
          className="mt-2 resize-none"
          placeholder="Briefly describe your story (up to 500 characters)"
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {values.storyDescription?.length || 0}/500 characters
        </p>
      </div>

      <div>
        <Label>Novel Length</Label>
        <Select
          value={values.novelLength}
          onValueChange={(value) => setValue('novelLength', value as NovelParameters['novelLength'])}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select novel length" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(NOVEL_LENGTHS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Chapter Structure</Label>
        <Select
          value={values.chapterStructure}
          onValueChange={(value) => setValue('chapterStructure', value as NovelParameters['chapterStructure'])}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select chapter structure" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Length</SelectItem>
            <SelectItem value="variable">Variable Length</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Average Chapter Length (words)</Label>
        <Input
          type="number"
          value={values.averageChapterLength}
          onChange={(e) => setValue('averageChapterLength', parseInt(e.target.value))}
          className="mt-2"
          min={1500}
          max={5000}
        />
      </div>

      <div>
        <Label>Chapter Naming Style</Label>
        <Select
          value={values.chapterNamingStyle}
          onValueChange={(value) => setValue('chapterNamingStyle', value as NovelParameters['chapterNamingStyle'])}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select naming style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="numbered">Numbered Only</SelectItem>
            <SelectItem value="titled">Titled Only</SelectItem>
            <SelectItem value="both">Both Number and Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}