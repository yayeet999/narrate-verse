import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.6.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { chunkId } = await req.json()
    
    if (!chunkId) {
      throw new Error('chunkId is required')
    }

    console.log('Fetching chunk with ID:', chunkId)
    
    // Fetch the chunk content
    const { data: chunk, error: fetchError } = await supabaseClient
      .from('story_reference_chunks')
      .select('content')
      .eq('id', chunkId)
      .single()

    if (fetchError || !chunk) {
      throw new Error(fetchError?.message || 'Chunk not found')
    }

    console.log('Generating embedding for chunk content')
    
    // Initialize Hugging Face client
    const hf = new HfInference()
    
    // Generate embedding using the all-MiniLM-L6-v2 model
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: chunk.content,
    })

    if (!response) {
      throw new Error('Failed to generate embedding')
    }

    console.log('Updating chunk with new embedding')
    
    // Update the chunk with the embedding
    const { error: updateError } = await supabaseClient
      .from('story_reference_chunks')
      .update({ embedding: response })
      .eq('id', chunkId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})