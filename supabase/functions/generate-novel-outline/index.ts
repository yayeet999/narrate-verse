import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('story_generation_sessions')
      .select('parameters, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    console.log('Retrieved session parameters:', session.parameters);

    // Generate embedding for vector search
    const embedding = await generateEmbedding(JSON.stringify(session.parameters));
    console.log('Generated embedding for vector search');

    // Search for relevant reference chunks
    const { data: chunks, error: searchError } = await supabase.rpc('match_story_chunks', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10
    });

    if (searchError) throw searchError;
    console.log('Found matching reference chunks:', chunks.length);

    // Generate outline using OpenAI
    const outline = await generateOutline(session.parameters, chunks);
    console.log('Generated novel outline');

    // Store the generated outline
    const { error: storeError } = await supabase
      .from('story_generation_data')
      .insert({
        session_id: sessionId,
        data_type: 'outline',
        content: JSON.stringify(outline)
      });

    if (storeError) throw storeError;

    // Update session status
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
    console.error('Error in generate-novel-outline:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateEmbedding(text: string): Promise<number[]> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002"
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function generateOutline(parameters: any, referenceChunks: any[]): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const systemPrompt = `You are a professional novel outline generator. Create a detailed novel outline based on the provided parameters and reference materials. The outline should include:
  1. Overall structure
  2. Chapter breakdowns
  3. Key plot points
  4. Character arcs
  5. Thematic elements

  Use the reference materials to inform the genre conventions, writing style, and structural elements.`;

  const userPrompt = `
  Novel Parameters:
  ${JSON.stringify(parameters, null, 2)}

  Reference Materials:
  ${referenceChunks.map(chunk => chunk.content).join('\n\n')}

  Generate a comprehensive novel outline following these specifications.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}