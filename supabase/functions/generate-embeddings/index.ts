import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== Edge Function: Generate Embeddings ===');
    
    // Get the request body
    const { chunkId } = await req.json()
    console.log('Processing chunk:', chunkId);

    if (!chunkId) {
      throw new Error('No chunk ID provided')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the chunk content
    console.log('Fetching chunk content...');
    const { data: chunk, error: fetchError } = await supabaseClient
      .from('story_reference_chunks')
      .select('content')
      .eq('id', chunkId)
      .single()

    if (fetchError) {
      console.error('Error fetching chunk:', fetchError);
      throw fetchError
    }

    if (!chunk) {
      console.error('No chunk found with ID:', chunkId);
      throw new Error('Chunk not found')
    }

    // Initialize Hugging Face client
    console.log('Initializing HF client...');
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

    // Generate embedding using the all-MiniLM-L6-v2 model
    console.log('Generating embedding...');
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: chunk.content,
    })

    // Update the chunk with the embedding
    console.log('Updating chunk with embedding...');
    const { error: updateError } = await supabaseClient
      .from('story_reference_chunks')
      .update({ embedding })
      .eq('id', chunkId)

    if (updateError) {
      console.error('Error updating chunk with embedding:', updateError);
      throw updateError
    }

    console.log('Successfully generated and stored embedding');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})