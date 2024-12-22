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

function calculateDimensions(parameters: any, matchedParams: any) {
  const dimensions = {
    complexity: 0,
    conflict: 0,
    emotionalDepth: 0,
    detail: 0,
    tone: 0,
    structuralExpansion: 0,
    pacing: 0,
    thematicResonance: 0,
    culturalCohesion: 0,
    characterChemistry: 0,
    genreAuthenticity: 0,
    narrativeMomentum: 0,
    worldIntegration: 0
  };

  dimensions.complexity = calculateComplexity(parameters, matchedParams);
  dimensions.conflict = calculateConflict(parameters, matchedParams);
  dimensions.emotionalDepth = calculateEmotionalDepth(parameters);
  dimensions.detail = calculateDetail(parameters);
  dimensions.tone = calculateTone(parameters);
  dimensions.structuralExpansion = calculateStructuralExpansion(parameters);
  dimensions.pacing = calculatePacing(parameters);
  dimensions.thematicResonance = calculateThematicResonance(parameters, matchedParams);
  dimensions.culturalCohesion = calculateCulturalCohesion(parameters);
  dimensions.characterChemistry = calculateCharacterChemistry(parameters);
  dimensions.genreAuthenticity = calculateGenreAuthenticity(parameters, matchedParams);
  dimensions.narrativeMomentum = calculateNarrativeMomentum(parameters);
  dimensions.worldIntegration = calculateWorldIntegration(parameters);

  applyGenreAdjustments(dimensions, parameters.primaryGenre);

  return normalizeDimensions(dimensions);
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