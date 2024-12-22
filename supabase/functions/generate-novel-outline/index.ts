import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log('Processing novel generation for session:', sessionId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
    });

    // Get session data
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
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: JSON.stringify(session.parameters),
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log('Generated embedding for vector search');

    // Search for relevant reference chunks
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

    // Prepare the prompt for outline generation
    const systemPrompt = `You are a professional novel outline generator. Create a detailed novel outline based on the provided parameters and reference materials. The outline should include:
    1. Overall structure
    2. Chapter breakdowns with titles and summaries
    3. Key plot points and scenes
    4. Character arcs and interactions
    5. Thematic elements

    Format the response as a JSON object with the following structure:
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

    const userPrompt = `
    Novel Parameters:
    ${JSON.stringify(session.parameters, null, 2)}

    Reference Materials:
    ${chunks.map(chunk => chunk.content).join('\n\n')}

    Generate a comprehensive novel outline following these specifications.`;

    console.log('Sending request to OpenAI');

    // Generate outline using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const outline = JSON.parse(completion.choices[0].message.content);
    console.log('Generated novel outline');

    // Store the generated outline
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});