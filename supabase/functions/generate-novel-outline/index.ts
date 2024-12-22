import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation function for outline structure
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

    if (!openAiKey.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format');
      throw new Error('Invalid OpenAI API key format. Please ensure you are using a valid OpenAI API key.');
    }

    const { sessionId } = await req.json();
    console.log('Processing novel generation for session:', sessionId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize OpenAI client
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
      match_count: 10
    });

    if (searchError) {
      console.error('Error searching for reference chunks:', searchError);
      throw searchError;
    }

    console.log('Found matching reference chunks:', chunks.length);
    
    // Log relevance scores for debugging
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1} relevance score:`, chunk.similarity);
      console.log(`Chunk ${index + 1} category:`, chunk.category);
    });

    if (chunks.length < 3) {
      console.warn('Warning: Found fewer than 3 relevant reference chunks');
    }

    // Prepare the prompt for outline generation
    const systemPrompt = `You are a professional novel outline generator. Create a detailed novel outline based on the provided parameters and reference materials. The outline should include:
    1. Overall structure
    2. Chapter breakdowns with titles and summaries
    3. Key plot points and scenes
    4. Character arcs and interactions
    5. Thematic elements

    IMPORTANT: Return ONLY a valid JSON object with no markdown formatting or additional text. The response must be parseable by JSON.parse().
    The JSON structure must be:
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

    // Generate outline using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `
          Novel Parameters:
          ${JSON.stringify(session.parameters, null, 2)}

          Reference Materials:
          ${chunks.map(chunk => chunk.content).join('\n\n')}

          Remember to return ONLY valid JSON with no markdown or additional text.`
        }
      ],
      temperature: 0.7
    });

    console.log('Received response from OpenAI');
    
    // Clean up the response and attempt to parse it
    let responseContent = completion.choices[0].message.content;
    console.log('Raw response:', responseContent);
    
    // Remove any markdown formatting if present
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n|\n```/g, '');
    }
    
    // Remove any leading/trailing whitespace
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

    // Validate outline structure
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