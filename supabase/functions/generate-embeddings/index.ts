import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting embedding generation process...');

    // Get the chunk ID from the request
    const { chunkId } = await req.json();
    console.log('Processing chunk ID:', chunkId);

    if (!chunkId) {
      throw new Error('No chunk ID provided');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the chunk content
    console.log('Fetching chunk content...');
    const { data: chunk, error: fetchError } = await supabaseClient
      .from('story_reference_chunks')
      .select('content')
      .eq('id', chunkId)
      .single();

    if (fetchError) {
      console.error('Error fetching chunk:', fetchError);
      throw fetchError;
    }

    if (!chunk) {
      console.error('No chunk found with ID:', chunkId);
      throw new Error('Chunk not found');
    }

    // Generate embedding using OpenAI
    console.log('Generating embedding with OpenAI...');
    const openAIResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: chunk.content,
        model: "text-embedding-3-small"
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await openAIResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Update the chunk with the embedding
    console.log('Updating chunk with embedding...');
    const { error: updateError } = await supabaseClient
      .from('story_reference_chunks')
      .update({ embedding })
      .eq('id', chunkId);

    if (updateError) {
      console.error('Error updating chunk with embedding:', updateError);
      throw updateError;
    }

    console.log('Successfully generated and stored embedding');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});