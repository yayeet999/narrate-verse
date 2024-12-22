import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { calculateDimensions } from '@/lib/novel/weightingSystem';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildEnhancedSystemPrompt(parameters: any, dimensions: any) {
  return `You are a professional novel outline generator specializing in ${parameters.primaryGenre} stories.

STORY DIMENSIONS:
${Object.entries(dimensions)
  .map(([key, value]) => `${key}: ${value.toFixed(2)}/2.5`)
  .join('\n')}

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

function getGenreFramework(genre: string): string {
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
- Puzzle-like structure, clue distribution, tension arcs
- Detective actively investigating
- Cozy Mystery with lighter tone
- Noir with gritty settings
- Thriller with higher stakes
    `,
    'Romance': `
- Focus on relationship arcs, emotional tension, intimacy
- Historical with period detail
- Paranormal with supernatural elements
    `,
    'Literary Fiction': `
- Emphasizes character introspection, thematic depth
- Satire with comedic but pointed social commentary
    `
  };
  return frameworks[genre] || "";
}

function generateDimensionGuidance(dimensions: any): string {
  return Object.entries(dimensions)
    .map(([dimension, value]) => generateGuidanceForDimension(dimension, value))
    .join('\n');
}

function generateGuidanceForDimension(dimension: string, value: number): string {
  const guidanceMap: Record<string, (v: number) => string> = {
    complexity: (v) => `Maintain complexity level ${v.toFixed(1)} through layered subplots and detailed world-building`,
    conflict: (v) => `Balance conflict intensity at ${v.toFixed(1)} across personal and external challenges`,
    emotionalDepth: (v) => `Develop emotional resonance to depth level ${v.toFixed(1)} in character interactions`,
    detail: (v) => `Ensure detail level ${v.toFixed(1)} through rich descriptions and environmental context`,
    tone: (v) => `Set tone at ${v.toFixed(1)} to match the overall mood of the story`,
    structuralExpansion: (v) => `Expand structure to ${v.toFixed(1)} for a more intricate plot`,
    pacing: (v) => `Adjust pacing to ${v.toFixed(1)} for optimal reader engagement`,
    thematicResonance: (v) => `Ensure thematic resonance at ${v.toFixed(1)} to align with chosen themes`,
    culturalCohesion: (v) => `Maintain cultural cohesion at ${v.toFixed(1)} for authenticity`,
    characterChemistry: (v) => `Enhance character chemistry to ${v.toFixed(1)} for dynamic interactions`,
    genreAuthenticity: (v) => `Ensure genre authenticity at ${v.toFixed(1)} to meet reader expectations`,
    narrativeMomentum: (v) => `Build narrative momentum to ${v.toFixed(1)} for a compelling story`,
    worldIntegration: (v) => `Integrate world elements at ${v.toFixed(1)} to enrich the narrative`
  };
  
  return guidanceMap[dimension]?.(value) || `Maintain ${dimension} at level ${value.toFixed(1)}`;
}

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
    console.log('Processing novel generation for session:', sessionId);

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

    console.log('Retrieved session parameters:', session.parameters);

    // Calculate dimensions using our new weighting system
    const dimensions = calculateDimensions(session.parameters);
    console.log('Calculated dimensions:', dimensions);

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

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    console.log('Received response from OpenAI');
    let responseContent = completion.choices[0].message.content;
    
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

    if (storeError) throw storeError;

    console.log('Updating session status...');
    const { error: updateError } = await supabase
      .from('story_generation_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) throw updateError;

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
