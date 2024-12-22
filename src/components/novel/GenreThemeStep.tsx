import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters, Genre, Theme } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GenreThemeStepProps {
  form: UseFormReturn<NovelParameters>;
}

const GENRE_CATEGORIES = {
  Fantasy: ['High Fantasy', 'Urban Fantasy', 'Dark Fantasy', 'Epic Fantasy'],
  'Science Fiction': ['Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Hard Sci-Fi'],
  Mystery: ['Detective', 'Cozy Mystery', 'Noir', 'Thriller'],
  Romance: ['Contemporary Romance', 'Historical Romance', 'Paranormal Romance', 'Romantic Comedy'],
  'Literary Fiction': ['Contemporary Fiction', 'Historical Fiction', 'Experimental Fiction', 'Satire']
} as const;

const THEMES: Theme[] = [
  'Coming of Age',
  'Redemption',
  'Love and Loss',
  'Power and Corruption',
  'Identity',
  'Good vs Evil'
];

export function GenreThemeStep({ form }: GenreThemeStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Primary Genre</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
              <RadioGroup
                value={values.primaryGenre}
                onValueChange={(value) => setValue('primaryGenre', value as Genre)}
                className="grid grid-cols-1 gap-2"
              >
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <RadioGroupItem value={genre} id={`primary-${genre}`} />
                    <Label htmlFor={`primary-${genre}`}>{genre}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base">Secondary Genre (Optional)</Label>
        <Select
          value={values.secondaryGenre}
          onValueChange={(value) => setValue('secondaryGenre', value as Genre)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a secondary genre" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(GENRE_CATEGORIES).flat().map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">Primary Theme</Label>
        <RadioGroup
          value={values.primaryTheme}
          onValueChange={(value) => setValue('primaryTheme', value as Theme)}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
        >
          {THEMES.map((theme) => (
            <div key={theme} className="flex items-center space-x-2">
              <RadioGroupItem value={theme} id={`primary-theme-${theme}`} />
              <Label htmlFor={`primary-theme-${theme}`}>{theme}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base">Secondary Theme (Optional)</Label>
        <Select
          value={values.secondaryTheme}
          onValueChange={(value) => setValue('secondaryTheme', value as Theme)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a secondary theme" />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}