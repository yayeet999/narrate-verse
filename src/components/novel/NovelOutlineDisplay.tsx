import { Card } from '@/components/ui/card';
import { NovelOutline } from '@/services/novel/types';

interface NovelOutlineDisplayProps {
  outline: NovelOutline;
}

export function NovelOutlineDisplay({ outline }: NovelOutlineDisplayProps) {
  if (!outline) return null;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{outline.title}</h2>
        <p className="text-muted-foreground mt-2">
          {outline.storyDescription}
        </p>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">World Details</h3>
        <p className="text-sm text-muted-foreground mb-2">{outline.worldDetails.setting}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">World Complexity</p>
            <p className="text-sm text-muted-foreground">{outline.worldDetails.worldComplexity}/5</p>
          </div>
          <div>
            <p className="text-sm font-medium">Cultural Depth</p>
            <p className="text-sm text-muted-foreground">{outline.worldDetails.culturalDepth}/5</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">Themes</h3>
        <div className="flex flex-wrap gap-2">
          {outline.themes.map((theme, index) => (
            <span key={index} className="px-2 py-1 bg-muted rounded-md text-sm">
              {theme}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">Characters</h3>
        <div className="space-y-4">
          {outline.characters.map((character, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <p className="font-medium">{character.name}</p>
              <p className="text-sm text-muted-foreground">Role: {character.role}</p>
              <p className="text-sm text-muted-foreground">{character.characterArc}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {outline.chapters.map((chapter) => (
          <Card key={chapter.chapterNumber} className="p-4">
            <h3 className="text-lg font-medium mb-2">
              Chapter {chapter.chapterNumber}: {chapter.chapterName}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {chapter.chapterSummary}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Key Plot Points:</p>
              <ul className="list-disc list-inside space-y-1">
                {chapter.keyPlotPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {outline.refinements && (
        <>
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Narrative Analysis</h3>
            {outline.refinements.narrativeIntensification && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Tension Points</h4>
                  {outline.refinements.narrativeIntensification.tensionPoints.map((point, index) => (
                    <div key={index} className="mt-2">
                      <p className="text-sm">Chapter {point.chapter}: {point.emotionalImpact}</p>
                      <p className="text-sm text-muted-foreground">{point.buildupNotes}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium">Pacing Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {outline.refinements.narrativeIntensification.pacingAnalysis}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-medium mb-2">Character Depth</h3>
            {outline.refinements.psychologicalComplexity?.characterDepth.map((char, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <h4 className="font-medium">{char.character}</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-sm font-medium">Internal Conflicts</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {char.internalConflicts.map((conflict, i) => (
                        <li key={i}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Motivation Layers</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {char.motivationLayers.map((layer, i) => (
                        <li key={i}>{layer}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}