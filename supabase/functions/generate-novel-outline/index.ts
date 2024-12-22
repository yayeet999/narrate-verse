import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { NovelParameters } from './types.ts';

interface StoryDimensions {
  complexity: number;
  conflict: number;
  emotionalDepth: number;
  detail: number;
  tone: number;
  structuralExpansion: number;
  pacing: number;
  thematicResonance: number;
  culturalCohesion: number;
  characterChemistry: number;
  genreAuthenticity: number;
  narrativeMomentum: number;
  worldIntegration: number;
}

function calculateDimensions(parameters: NovelParameters): StoryDimensions {
  const dimensions: StoryDimensions = {
    complexity: calculateComplexity(parameters),
    conflict: calculateConflict(parameters),
    emotionalDepth: parameters.emotionalIntensity * 0.5,
    detail: (parameters.toneDescriptive + parameters.descriptionDensity) * 0.3,
    tone: 1.5 + (parameters.toneFormality - 3) * 0.2,
    structuralExpansion: calculateStructuralExpansion(parameters),
    pacing: (parameters.pacingOverall + parameters.pacingVariance) * 0.3,
    thematicResonance: calculateThematicResonance(parameters),
    culturalCohesion: parameters.culturalDepth * 0.4,
    characterChemistry: parameters.characters.length * 0.3,
    genreAuthenticity: calculateGenreAuthenticity(parameters),
    narrativeMomentum: (parameters.pacingOverall + parameters.emotionalIntensity) * 0.25,
    worldIntegration: (parameters.worldComplexity + parameters.culturalDepth) * 0.3
  };

  return normalizeAndAdjustDimensions(dimensions, parameters);
}

function calculateComplexity(parameters: NovelParameters): number {
  const base = 1.0;
  const worldFactor = parameters.worldComplexity * 0.2;
  const culturalFactor = parameters.culturalDepth * 0.15;
  const genreBonus = parameters.primaryGenre === 'Hard Sci-Fi' ? 0.3 : 0;
  return base + worldFactor + culturalFactor + genreBonus;
}

function calculateConflict(parameters: NovelParameters): number {
  const base = 1.0;
  const violenceFactor = parameters.violenceLevel * 0.3;
  const conflictTypes = parameters.conflictTypes.length * 0.2;
  return base + violenceFactor + conflictTypes;
}

function calculateStructuralExpansion(parameters: NovelParameters): number {
  const lengthFactors: Record<string, number> = {
    '50k-100k': 1.0,
    '100k-150k': 1.5,
    '150k+': 2.0
  };
  return lengthFactors[parameters.novelLength] || 1.0;
}

function calculateThematicResonance(parameters: NovelParameters): number {
  const base = 1.0;
  const themeMatches = checkThemeGenreMatch(parameters) ? 0.5 : 0;
  return base + themeMatches;
}

function calculateGenreAuthenticity(parameters: NovelParameters): number {
  const base = 1.0;
  const genreBonus = checkGenreRequirements(parameters) ? 0.5 : 0;
  return base + genreBonus;
}

function checkThemeGenreMatch(parameters: NovelParameters): boolean {
  const genreThemes: Record<string, string[]> = {
    'High Fantasy': ['Good vs Evil', 'Power and Corruption'],
    'Detective': ['Identity', 'Redemption']
  };
  return genreThemes[parameters.primaryGenre]?.includes(parameters.primaryTheme) || false;
}

function checkGenreRequirements(parameters: NovelParameters): boolean {
  switch (parameters.primaryGenre) {
    case 'Hard Sci-Fi':
      return parameters.worldComplexity >= 4;
    case 'Epic Fantasy':
      return parameters.worldComplexity >= 3 && parameters.culturalDepth >= 3;
    default:
      return true;
  }
}

function normalizeAndAdjustDimensions(dimensions: StoryDimensions, parameters: NovelParameters): StoryDimensions {
  Object.keys(dimensions).forEach(key => {
    dimensions[key as keyof StoryDimensions] = Math.min(
      dimensions[key as keyof StoryDimensions],
      2.5
    );
  });

  switch (parameters.primaryGenre) {
    case 'High Fantasy':
    case 'Epic Fantasy':
      dimensions.complexity *= 1.2;
      dimensions.worldIntegration *= 1.3;
      break;
    case 'Hard Sci-Fi':
      dimensions.complexity *= 1.4;
      dimensions.detail *= 1.3;
      break;
    case 'Detective':
    case 'Noir':
      dimensions.narrativeMomentum *= 1.2;
      dimensions.conflict *= 1.1;
      break;
  }

  Object.keys(dimensions).forEach(key => {
    dimensions[key as keyof StoryDimensions] = Math.min(
      dimensions[key as keyof StoryDimensions],
      2.5
    );
  });

  return dimensions;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { sessionId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    const { data: session, error: sessionError } = await supabase
      .from('story_generation_sessions')
      .select('parameters, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('Session not found');

    const dimensions = calculateDimensions(session.parameters);
    const systemPrompt = buildEnhancedSystemPrompt(session.parameters, dimensions);
    const userPrompt = `Generate a detailed novel outline following these parameters:
${JSON.stringify(session.parameters, null, 2)}

Required JSON Structure:
{
  "chapters": [{
    "chapterNumber": number,
    "title": string,
    "summary": string,
    "scenes": [{
      "id": string,
      "sceneFocus": string,
      "conflict": string,
      "settingDetails": string,
      "characterInvolvement": string[]
    }]
  }],
  "metadata": {
    "totalEstimatedWordCount": number,
    "mainTheme": string,
    "creationTimestamp": string
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    let responseContent = completion.choices[0].message.content;
    
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n|\n```/g, '');
    }
    
    responseContent = responseContent.trim();
    
    let outline;
    try {
      outline = JSON.parse(responseContent);
    } catch (parseError) {
      throw new Error(`Failed to parse outline JSON: ${parseError.message}`);
    }

    if (!validateOutlineStructure(outline)) {
      throw new Error('Generated outline does not match required structure');
    }

    const { error: storeError } = await supabase
      .from('story_generation_data')
      .insert({
        session_id: sessionId,
        data_type: 'outline',
        content: JSON.stringify(outline)
      });

    if (storeError) throw storeError;

    const { error: updateError } = await supabase
      .from('story_generation_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
