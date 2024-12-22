import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Organize reference parameters by category and weight
function organizeParameters(parameters: any[]) {
  const categories = {
    genre_conventions: [] as any[],
    narrative_structure: [] as any[],
    character_development: [] as any[],
    world_building: [] as any[],
    pacing_guidelines: [] as any[],
    thematic_elements: [] as any[],
    style_guidelines: [] as any[],
  };

  parameters.forEach(param => {
    if (categories[param.category]) {
      categories[param.category].push({
        description: param.description,
        weight: param.weight,
        similarity: param.similarity
      });
    }
  });

  // Sort each category by weighted similarity
  Object.keys(categories).forEach(key => {
    categories[key].sort((a, b) => (b.weight * b.similarity) - (a.weight * a.similarity));
  });

  return categories;
}

function buildSystemPrompt(parameters: any, referenceParams: any) {
  const genreGuidelines = referenceParams.genre_conventions
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 3)
    .join('\n');

  const narrativeGuidelines = referenceParams.narrative_structure
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 3)
    .join('\n');

  const characterGuidelines = referenceParams.character_development
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 3)
    .join('\n');

  return `You are a professional novel outline generator specializing in ${parameters.primaryGenre} stories.

WEIGHTED GUIDELINES:
Genre Guidelines (High Priority):
${genreGuidelines}

Narrative Structure Guidelines:
${narrativeGuidelines}

Character Development Guidelines:
${characterGuidelines}

STRICT REQUIREMENTS:
1. Maintain absolute consistency with user parameters
2. Follow weighted genre conventions while allowing for innovation
3. Ensure character arcs align with provided archetypes
4. Balance pacing according to specified preferences
5. Incorporate thematic elements throughout the outline
6. Respect content control parameters (violence, adult content, etc.)

TECHNICAL REQUIREMENTS:
1. Return ONLY a valid JSON object
2. No markdown or additional text
3. Must be parseable by JSON.parse()
4. Follow exact structure specified in the user prompt`;
}

function buildUserPrompt(parameters: any, referenceParams: any) {
  const worldBuildingGuidelines = referenceParams.world_building
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 2)
    .join('\n');

  const thematicGuidelines = referenceParams.thematic_elements
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 2)
    .join('\n');

  const styleGuidelines = referenceParams.style_guidelines
    .map(p => `${p.description} (Weight: ${p.weight})`)
    .slice(0, 2)
    .join('\n');

  return `Generate a detailed novel outline following these weighted parameters:

NOVEL PARAMETERS:
${JSON.stringify(parameters, null, 2)}

WEIGHTED WORLD-BUILDING GUIDELINES:
${worldBuildingGuidelines}

WEIGHTED THEMATIC GUIDELINES:
${thematicGuidelines}

WEIGHTED STYLE GUIDELINES:
${styleGuidelines}

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
}

Remember to incorporate the weighted guidelines according to their importance scores.`;
}

function validateOutlineStructure(outline: any): boolean {
  try {
    // Check basic structure
    if (!outline.chapters || !Array.isArray(outline.chapters)) return false;
    if (!outline.metadata) return false;

    // Validate each chapter
    for (const chapter of outline.chapters) {
      if (!chapter.chapterNumber || !chapter.title || !chapter.summary) return false;
      if (!chapter.scenes || !Array.isArray(chapter.scenes)) return false;

      // Validate each scene
      for (const scene of chapter.scenes) {
        if (!scene.id || !scene.sceneFocus || !scene.conflict || !scene.settingDetails) return false;
        if (!scene.characterInvolvement || !Array.isArray(scene.characterInvolvement)) return false;
      }
    }

    // Validate metadata
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

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    // Get session data
    console.log('Fetching session data...');
    const { data: session, error: sessionError } = await supabase
      .from('story_generation_sessions')
      .select('parameters, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      throw new Error('Session not found');
    }

    console.log('Retrieved session parameters:', session.parameters);

    // Generate embedding for parameter matching
    console.log('Generating embedding for parameter matching...');
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(session.parameters),
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log('Generated embedding for parameter matching');

    // Match novel parameters using the new function
    console.log('Matching novel parameters...');
    const { data: matchedParams, error: matchError } = await supabase.rpc('match_novel_parameters', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 20
    });

    if (matchError) {
      console.error('Error matching parameters:', matchError);
      throw matchError;
    }

    console.log('Found matching parameters:', matchedParams.length);
    matchedParams.forEach((param, index) => {
      console.log(`Parameter ${index + 1} weight:`, param.weight);
      console.log(`Parameter ${index + 1} similarity:`, param.similarity);
    });

    // Organize and process parameters
    const organizedParams = organizeParameters(matchedParams);
    console.log('Organized parameters by category:', Object.keys(organizedParams));

    // Build enhanced prompts with weighted parameters
    const systemPrompt = buildSystemPrompt(session.parameters, organizedParams);
    const userPrompt = buildUserPrompt(session.parameters, organizedParams);

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

    // Store the generated outline
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

    // Update session status
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