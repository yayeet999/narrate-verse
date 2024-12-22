import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Organize reference chunks by category and relevance
function organizeReferenceChunks(chunks: any[]) {
  const categories = {
    genre_conventions: [] as any[],
    plot_structures: [] as any[],
    character_development: [] as any[],
    world_building: [] as any[],
    thematic_elements: [] as any[],
    technical_guidelines: [] as any[],
    other: [] as any[],
  };

  chunks.forEach(chunk => {
    const category = chunk.category?.toLowerCase().replace(/[^a-z_]/g, '_') || 'other';
    const relevanceScore = chunk.similarity || 0;
    
    // Only include chunks with good relevance
    if (relevanceScore >= 0.7) {
      if (categories[category]) {
        categories[category].push({
          content: chunk.content,
          relevance: relevanceScore
        });
      } else {
        categories.other.push({
          content: chunk.content,
          relevance: relevanceScore
        });
      }
    }
  });

  // Sort each category by relevance
  Object.keys(categories).forEach(key => {
    categories[key].sort((a, b) => b.relevance - a.relevance);
  });

  return categories;
}

// Build enhanced system prompt using reference materials
function buildSystemPrompt(parameters: any, referenceChunks: any) {
  const genreGuidelines = referenceChunks.genre_conventions
    .map(c => c.content)
    .slice(0, 3)
    .join('\n');

  const plotStructures = referenceChunks.plot_structures
    .map(c => c.content)
    .slice(0, 3)
    .join('\n');

  const characterGuidelines = referenceChunks.character_development
    .map(c => c.content)
    .slice(0, 3)
    .join('\n');

  return `You are a professional novel outline generator specializing in ${parameters.primaryGenre} stories.

CONTEXT AND GUIDELINES:
Genre Conventions:
${genreGuidelines}

Plot Structure Guidelines:
${plotStructures}

Character Development Guidelines:
${characterGuidelines}

STRICT REQUIREMENTS:
1. Maintain absolute consistency with user parameters
2. Follow genre conventions while allowing for innovation
3. Ensure character arcs align with provided archetypes
4. Balance pacing according to specified preferences
5. Incorporate thematic elements throughout the outline
6. Respect content control parameters (violence, adult content, etc.)

TECHNICAL REQUIREMENTS:
1. Return ONLY a valid JSON object
2. No markdown or additional text
3. Must be parseable by JSON.parse()
4. Follow exact structure:
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

IMPORTANT GUIDELINES:
- Each chapter should advance both plot and character development
- Maintain consistent tone and style throughout
- Ensure proper setup and payoff for major plot points
- Balance dialogue, action, and description based on user preferences
- Incorporate world-building elements naturally into scenes
- Ensure conflicts escalate properly throughout the outline`;
}

// Build user prompt incorporating parameters and reference materials
function buildUserPrompt(parameters: any, referenceChunks: any) {
  const worldBuildingGuidelines = referenceChunks.world_building
    .map(c => c.content)
    .slice(0, 2)
    .join('\n');

  const thematicGuidelines = referenceChunks.thematic_elements
    .map(c => c.content)
    .slice(0, 2)
    .join('\n');

  const technicalGuidelines = referenceChunks.technical_guidelines
    .map(c => c.content)
    .slice(0, 2)
    .join('\n');

  return `Generate a detailed novel outline following these specifications:

NOVEL PARAMETERS:
${JSON.stringify(parameters, null, 2)}

WORLD-BUILDING CONSIDERATIONS:
${worldBuildingGuidelines}

THEMATIC GUIDELINES:
${thematicGuidelines}

TECHNICAL SPECIFICATIONS:
${technicalGuidelines}

Additional Reference Materials:
${referenceChunks.other.map(c => c.content).join('\n')}

Remember:
1. Strictly adhere to the provided JSON structure
2. Ensure all character arcs are fully developed
3. Maintain consistent pacing and tone
4. Balance exposition and action
5. Incorporate thematic elements naturally

Return ONLY valid JSON with no additional text or formatting.`;
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
      throw new Error('OpenAI API key is not configured. Please set it in the Supabase dashboard.');
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

    // Generate embedding for vector search
    console.log('Generating embedding for vector search...');
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(session.parameters),
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log('Generated embedding for vector search');

    // Search for relevant reference chunks
    console.log('Searching for reference chunks...');
    const { data: chunks, error: searchError } = await supabase.rpc('match_story_chunks', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 15 // Increased from 10 to get more relevant chunks
    });

    if (searchError) {
      console.error('Error searching for reference chunks:', searchError);
      throw searchError;
    }

    console.log('Found matching reference chunks:', chunks.length);
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1} relevance score:`, chunk.similarity);
      console.log(`Chunk ${index + 1} category:`, chunk.category);
    });

    // Organize and process reference chunks
    const organizedChunks = organizeReferenceChunks(chunks);
    console.log('Organized chunks by category:', Object.keys(organizedChunks));

    // Build enhanced prompts
    const systemPrompt = buildSystemPrompt(session.parameters, organizedChunks);
    const userPrompt = buildUserPrompt(session.parameters, organizedChunks);

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