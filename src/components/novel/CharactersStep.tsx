import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NovelParameters, Character, CharacterRole, CharacterArchetype, ArcType } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface CharactersStepProps {
  form: UseFormReturn<NovelParameters>;
}

const CHARACTER_ROLES: CharacterRole[] = ['protagonist', 'antagonist', 'supporting'];
const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  'The Hero', 'The Mentor', 'The Sidekick', 'The Love Interest',
  'The Villain', 'The Anti-Hero', 'The Trickster', 'The Sage'
];
const ARC_TYPES: ArcType[] = [
  'redemption', 'fall', 'coming_of_age', 'internal_discovery', 'static'
];

export function CharactersStep({ form }: CharactersStepProps) {
  const { watch, setValue } = form;
  const values = watch();

  const addCharacter = () => {
    const newCharacter: Character = {
      name: '',
      role: 'supporting',
      archetype: 'The Hero',
      ageRange: '',
      backgroundArchetype: '',
      arcType: 'internal_discovery',
      relationships: []
    };
    setValue('characters', [...values.characters, newCharacter]);
  };

  const removeCharacter = (index: number) => {
    const updatedCharacters = values.characters.filter((_, i) => i !== index);
    setValue('characters', updatedCharacters);
  };

  const updateCharacter = (index: number, field: keyof Character, value: any) => {
    const updatedCharacters = values.characters.map((char, i) => {
      if (i === index) {
        return { ...char, [field]: value };
      }
      return char;
    });
    setValue('characters', updatedCharacters);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Label className="text-base">Characters</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCharacter}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Character
        </Button>
      </div>

      <div className="space-y-6">
        {values.characters.map((character, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <Input
                value={character.name}
                onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                placeholder="Character Name"
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCharacter(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <RadioGroup
                  value={character.role}
                  onValueChange={(value) => updateCharacter(index, 'role', value)}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  {CHARACTER_ROLES.map((role) => (
                    <div key={role}>
                      <RadioGroupItem value={role} id={`role-${index}-${role}`} className="peer sr-only" />
                      <Label
                        htmlFor={`role-${index}-${role}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary text-sm"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Archetype</Label>
                <Select
                  value={character.archetype}
                  onValueChange={(value) => updateCharacter(index, 'archetype', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHARACTER_ARCHETYPES.map((archetype) => (
                      <SelectItem key={archetype} value={archetype}>
                        {archetype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age Range</Label>
                <Input
                  value={character.ageRange}
                  onChange={(e) => updateCharacter(index, 'ageRange', e.target.value)}
                  placeholder="e.g., Young Adult, Middle-aged"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Background</Label>
                <Input
                  value={character.backgroundArchetype}
                  onChange={(e) => updateCharacter(index, 'backgroundArchetype', e.target.value)}
                  placeholder="Character's background"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Character Arc</Label>
                <Select
                  value={character.arcType}
                  onValueChange={(value) => updateCharacter(index, 'arcType', value as ArcType)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARC_TYPES.map((arc) => (
                      <SelectItem key={arc} value={arc}>
                        {arc.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {values.characters.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No characters added yet. Click the "Add Character" button to get started.
        </div>
      )}
    </div>
  );
}