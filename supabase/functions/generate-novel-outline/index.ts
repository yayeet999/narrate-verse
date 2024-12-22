import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function processMatchedParameters(parameters: any[]) {
  const categorizedParams = {
    genre: [] as any[],
    theme: [] as any[],
    structure: [] as any[],
    style: [] as any[],
    technical: [] as any[],
    content: [] as any[],
  };

  parameters.forEach(param => {
    const weight = param.weight * param.similarity;
    const weightedDescription = `${param.description} (Impact: ${weight.toFixed(2)})`;
    
    switch (param.category) {
      case 'genre_conventions':
        categorizedParams.genre.push(weightedDescription);
        break;
      case 'thematic_elements':
        categorizedParams.theme.push(weightedDescription);
        break;
      case 'narrative_structure':
        categorizedParams.structure.push(weightedDescription);
        break;
      case 'writing_style':
        categorizedParams.style.push(weightedDescription);
        break;
      case 'technical_requirements':
        categorizedParams.technical.push(weightedDescription);
        break;
      case 'content_controls':
        categorizedParams.content.push(weightedDescription);
        break;
    }
  });

  return categorizedParams;
}

function calculateComplexity(parameters: any, matchedParams: any) {
  const base = 1.0;
  const worldFactor = parameters.worldComplexity * 0.2;
  const culturalFactor = parameters.culturalDepth * 0.15;
  const genreBonus = parameters.primaryGenre === 'Hard Sci-Fi' ? 0.3 : 0;
  return Math.min(base + worldFactor + culturalFactor + genreBonus, 2.5);
}

function calculateConflict(parameters: any, matchedParams: any) {
  const base = 1.0;
  const violenceFactor = parameters.violenceLevel * 0.3;
  const conflictTypes = parameters.conflictTypes.length * 0.2;
  return Math.min(base + violenceFactor + conflictTypes, 2.5);
}

function calculateEmotionalDepth(parameters: any) {
  return Math.min(parameters.emotionalIntensity * 0.5, 2.5);
}

function calculateDetail(parameters: any) {
  return Math.min((parameters.toneDescriptive + parameters.descriptionDensity) * 0.3, 2.5);
}

function calculateTone(parameters: any) {
  const base = 1.5;
  return Math.min(base + (parameters.toneFormality - 3) * 0.2, 2.5);
}

function calculateStructuralExpansion(parameters: any) {
  const lengthFactors: Record<string, number> = {
    '50k-100k': 1.0,
    '100k-150k': 1.5,
    '150k+': 2.0
  };
  return Math.min(lengthFactors[parameters.novelLength] || 1.0, 2.5);
}

function calculatePacing(parameters: any) {
  return Math.min((parameters.pacingOverall + parameters.pacingVariance) * 0.3, 2.5);
}

function calculateThematicResonance(parameters: any, matchedParams: any) {
  const base = 1.0;
  const themeMatches = matchedParams.theme ? matchedParams.theme.length * 0.2 : 0;
  return Math.min(base + themeMatches, 2.5);
}

function calculateCulturalCohesion(parameters: any) {
  return Math.min(parameters.culturalDepth * 0.4, 2.5);
}

function calculateCharacterChemistry(parameters: any) {
  return Math.min(parameters.characters.length * 0.3, 2.5);
}

function calculateGenreAuthenticity(parameters: any, matchedParams: any) {
  const base = 1.0;
  const genreMatches = matchedParams.genre ? matchedParams.genre.length * 0.2 : 0;
  return Math.min(base + genreMatches, 2.5);
}

function calculateNarrativeMomentum(parameters: any) {
  return Math.min((parameters.pacingOverall + parameters.emotionalIntensity) * 0.25, 2.5);
}

function calculateWorldIntegration(parameters: any) {
  return Math.min((parameters.worldComplexity + parameters.culturalDepth) * 0.3, 2.5);
}

function calculateDimensions(parameters: any, matchedParams: any) {
  const dimensions = {
    complexity: calculateComplexity(parameters, matchedParams),
    conflict: calculateConflict(parameters, matchedParams),
    emotionalDepth: calculateEmotionalDepth(parameters),
    detail: calculateDetail(parameters),
    tone: calculateTone(parameters),
    structuralExpansion: calculateStructuralExpansion(parameters),
    pacing: calculatePacing(parameters),
    thematicResonance: calculateThematicResonance(parameters, matchedParams),
    culturalCohesion: calculateCulturalCohesion(parameters),
    characterChemistry: calculateCharacterChemistry(parameters),
    genreAuthenticity: calculateGenreAuthenticity(parameters, matchedParams),
    narrativeMomentum: calculateNarrativeMomentum(parameters),
    worldIntegration: calculateWorldIntegration(parameters)
  };

  return applyGenreAdjustments(dimensions, parameters.primaryGenre);
}

function applyGenreAdjustments(dimensions: any, genre: string) {
  const adjustedDimensions = { ...dimensions };

  switch (genre) {
    case 'High Fantasy':
    case 'Epic Fantasy':
      adjustedDimensions.complexity *= 1.2;
      adjustedDimensions.worldIntegration *= 1.3;
      break;
    case 'Hard Sci-Fi':
      adjustedDimensions.complexity *= 1.4;
      adjustedDimensions.detail *= 1.3;
      break;
    case 'Detective':
    case 'Noir':
      adjustedDimensions.narrativeMomentum *= 1.2;
      adjustedDimensions.conflict *= 1.1;
      break;
  }

  // Ensure no dimension exceeds 2.5
  Object.keys(adjustedDimensions).forEach(key => {
    adjustedDimensions[key] = Math.min(adjustedDimensions[key], 2.5);
  });

  return adjustedDimensions;
}

function normalizeDimensions(dimensions: any) {
  const sum = Object.values(dimensions).reduce((a: number, b: number) => a + b, 0);
  const maxSum = 25; // Maximum allowed sum of all dimensions
  
  if (sum > maxSum) {
    const factor = maxSum / sum;
    const normalized = {} as any;
    Object.entries(dimensions).forEach(([key, value]) => {
      normalized[key] = (value as number) * factor;
    });
    return normalized;
  }
  
  return dimensions;
}

function buildEnhancedSystemPrompt(parameters: any, matchedParams: any) {
  const dimensions = calculateDimensions(parameters, matchedParams);
  
  return `You are a professional novel outline generator specializing in ${parameters.primaryGenre} stories.

WEIGHTED PARAMETER GUIDELINES:
${formatParameterGuidelines(matchedParams)}

STORY DIMENSIONS:
${formatDimensions(dimensions)}

GENRE-SPECIFIC FRAMEWORK:
${getGenreFramework(parameters.primaryGenre)}

TECHNICAL REQUIREMENTS:
1. Return ONLY a valid JSON object
2. No markdown or additional text
3. Must be parseable by JSON.parse()
4. Follow exact structure specified in the user prompt

DIMENSION-BASED GUIDANCE:
${generateDimensionGuidance(dimensions)}`;
}

function formatParameterGuidelines(matchedParams: any) {
  return Object.entries(matchedParams)
    .map(([category, params]) => {
      return `${category.toUpperCase()}:\n${params.join('\n')}`;
    })
    .join('\n\n');
}

function formatDimensions(dimensions: any) {
  return Object.entries(dimensions)
    .map(([key, value]) => `${key}: ${value.toFixed(2)}/2.5 - ${getDimensionDescription(key)}`)
    .join('\n');
}

function getDimensionDescription(dimension: string) {
  const descriptions: Record<string, string> = {
    complexity: "Subplot layering, world-building depth, political intricacies",
    conflict: "Aggressiveness, moral or physical tension, confrontation scale",
    emotionalDepth: "Character feelings, relationship dynamics, emotional impact",
    detail: "Environmental descriptions, character details, action precision",
    tone: "Overall mood, atmosphere, narrative voice",
    structuralExpansion: "Plot complexity, chapter organization, narrative layers",
    pacing: "Story rhythm, scene transitions, tension management",
    thematicResonance: "Theme integration, symbolic depth, message clarity",
    culturalCohesion: "World consistency, social dynamics, cultural authenticity",
    characterChemistry: "Character interactions, relationship development, cast dynamics",
    genreAuthenticity: "Genre convention adherence, trope usage, reader expectations",
    narrativeMomentum: "Story progression, plot advancement, reader engagement",
    worldIntegration: "Setting incorporation, world-building elements, environmental impact"
  };
  return descriptions[dimension] || "";
}

function getGenreFramework(genre: string) {
  const frameworks: Record<string, string> = {
    'High Fantasy': `
- Increased complexity and detail requirements
- World-building emphasis
- Multiple kingdom/faction dynamics
- Magic system integration
- Epic scope and scale
    `,
    'Urban Fantasy': `
- Modern world integration
- Hidden supernatural elements
- Character-driven narrative
- Mystery/investigation elements
- Reality/magic balance
    `,
    'Science Fiction': `
- Technical detail requirements
- Scientific plausibility
- Future world-building
- Technology impact themes
- Social implications focus
    `,
    'Mystery': `
- Clue placement
- Red herring management
- Investigation pacing
- Character suspicion balance
- Resolution satisfaction
    `
  };
  return frameworks[genre] || "";
}

function generateDimensionGuidance(dimensions: any) {
  return Object.entries(dimensions)
    .map(([dimension, value]) => generateGuidanceForDimension(dimension, value))
    .join('\n');
}

function generateGuidanceForDimension(dimension: string, value: number) {
  const guidanceMap: Record<string, (v: number) => string> = {
    complexity: (v) => `Maintain complexity level ${v.toFixed(1)} through layered subplots and detailed world-building`,
    conflict: (v) => `Balance conflict intensity at ${v.toFixed(1)} across personal and external challenges`,
    emotionalDepth: (v) => `Develop emotional resonance to depth level ${v.toFixed(1)} in character interactions`,
    // Add guidance for other dimensions
  };
  
  return guidanceMap[dimension]?.(value) || `Maintain ${dimension} at level ${value.toFixed(1)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Checking OpenAI API key configuration...');
    
    if (!openAiKey) {
      console.error('OpenAI API key is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const { sessionId } = await req.json();
    console.log('Processing novel generation for session:', sessionId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    console.log('Fetching session data...');
    const { data: session, error: sessionError } = await supabase
      .from('story_generation_sessions')
      .select('parameters, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('Session not found');

    console.log('Retrieved session parameters:', session.parameters);

    console.log('Generating embedding for parameter matching...');
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(session.parameters),
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log('Generated embedding for parameter matching');

    console.log('Matching novel parameters...');
    const { data: matchedParams, error: matchError } = await supabase.rpc('match_novel_parameters', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 20
    });

    if (matchError) throw matchError;

    console.log('Found matching parameters:', matchedParams.length);
    
    const processedParams = processMatchedParameters(matchedParams);
    console.log('Processed and categorized parameters');

    const systemPrompt = buildEnhancedSystemPrompt(session.parameters, processedParams);
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

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    console.log('Received response from OpenAI');
    let responseContent = completion.choices[0].message.content;
    console.log('Raw response:', responseContent);
    
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n|\n```/g, '');
    }
    
    responseContent = responseContent.trim();
    
    let outline;
    try {
      outline = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Response content:', responseContent);
      throw new Error(`Failed to parse outline JSON: ${parseError.message}`);
    }
    
    console.log('Successfully parsed outline JSON');

    if (!validateOutlineStructure(outline)) {
      throw new Error('Generated outline does not match required structure');
    }

    console.log('Storing generated outline...');
    const { error: storeError } = await supabase
      .from('story_generation_data')
      .insert({
        session_id: sessionId,
        data_type: 'outline',
        content: JSON.stringify(outline)
      });

    if (storeError) {
      console.error('Error storing outline:', storeError);
      throw storeError;
    }

    console.log('Updating session status...');
    const { error: updateError } = await supabase
      .from('story_generation_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session status:', updateError);
      throw updateError;
    }

    console.log('Successfully completed novel generation');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-novel-outline:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
