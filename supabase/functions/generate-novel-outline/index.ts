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

function buildEnhancedSystemPrompt(parameters: any, matchedParams: any) {
  return `You are a professional novel outline generator specializing in ${parameters.primaryGenre} stories.

WEIGHTED PARAMETER GUIDELINES:
Genre Conventions (High Priority):
${matchedParams.genre.join('\n')}

Thematic Elements:
${matchedParams.theme.join('\n')}

Narrative Structure:
${matchedParams.structure.join('\n')}

Writing Style:
${matchedParams.style.join('\n')}

Technical Requirements:
${matchedParams.technical.join('\n')}

Content Controls:
${matchedParams.content.join('\n')}

STORY DIMENSIONS TO CONSIDER:
1. Complexity: ${calculateComplexityGuidance(parameters)}
2. Conflict: ${calculateConflictGuidance(parameters)}
3. Emotional Depth: ${calculateEmotionalDepthGuidance(parameters)}
4. World Integration: ${calculateWorldIntegrationGuidance(parameters)}
5. Pacing: ${calculatePacingGuidance(parameters)}

STRICT REQUIREMENTS:
1. Maintain absolute consistency with user parameters
2. Follow weighted genre conventions while allowing for innovation
3. Ensure character arcs align with provided archetypes
4. Balance pacing according to specified preferences
5. Incorporate thematic elements throughout the outline
6. Respect content control parameters

TECHNICAL REQUIREMENTS:
1. Return ONLY a valid JSON object
2. No markdown or additional text
3. Must be parseable by JSON.parse()
4. Follow exact structure specified in the user prompt`;
}

function calculateComplexityGuidance(parameters: any): string {
  const base = 1.0;
  const worldFactor = parameters.worldComplexity * 0.2;
  const culturalFactor = parameters.culturalDepth * 0.15;
  const complexity = Math.min(base + worldFactor + culturalFactor, 2.5);
  return `Target level ${complexity.toFixed(1)}/2.5 - Adjust subplot density and world-building detail accordingly`;
}

function calculateConflictGuidance(parameters: any): string {
  const base = 1.0;
  const violenceFactor = parameters.violenceLevel * 0.3;
  const conflictTypes = parameters.conflictTypes.length * 0.2;
  const conflict = Math.min(base + violenceFactor + conflictTypes, 2.5);
  return `Target level ${conflict.toFixed(1)}/2.5 - Balance internal and external conflicts`;
}

function calculateEmotionalDepthGuidance(parameters: any): string {
  const depth = parameters.emotionalIntensity * 0.5;
  return `Target level ${depth.toFixed(1)}/2.5 - Focus on character emotional development`;
}

function calculateWorldIntegrationGuidance(parameters: any): string {
  const integration = (parameters.worldComplexity + parameters.culturalDepth) * 0.3;
  return `Target level ${integration.toFixed(1)}/2.5 - Weave setting elements into plot`;
}

function calculatePacingGuidance(parameters: any): string {
  const pacing = (parameters.pacingOverall + parameters.pacingVariance) * 0.3;
  return `Target level ${pacing.toFixed(1)}/2.5 - Adjust scene and chapter rhythm`;
}

function validateOutlineStructure(outline: any): boolean {
  try {
    if (!outline.chapters || !Array.isArray(outline.chapters)) return false;
    if (!outline.metadata) return false;

    for (const chapter of outline.chapters) {
      if (!chapter.chapterNumber || !chapter.title || !chapter.summary) return false;
      if (!chapter.scenes || !Array.isArray(chapter.scenes)) return false;

      for (const scene of chapter.scenes) {
        if (!scene.id || !scene.sceneFocus || !scene.conflict || !scene.settingDetails) return false;
        if (!scene.characterInvolvement || !Array.isArray(scene.characterInvolvement)) return false;
      }
    }

    if (!outline.metadata.totalEstimatedWordCount || !outline.metadata.mainTheme) return false;

    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
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
      model: "gpt-4o",
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