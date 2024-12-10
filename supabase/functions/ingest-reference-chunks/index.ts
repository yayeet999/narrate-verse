import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0"

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
    const { chunks } = await req.json()
    
    if (!chunks || !Array.isArray(chunks)) {
      throw new Error('Invalid chunks format')
    }

    console.log(`Processing ${chunks.length} chunks...`)

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const processedChunks = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}...`)

      // Generate embedding for the chunk
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: chunk.content,
      })

      const [{ embedding }] = embeddingResponse.data.data

      // Store chunk with embedding
      const { data, error } = await supabase
        .from('story_reference_chunks')
        .insert({
          chunk_number: chunk.number,
          content: chunk.content,
          category: chunk.category || 'general',
          embedding
        })
        .select()

      if (error) {
        throw new Error(`Failed to store chunk ${i + 1}: ${error.message}`)
      }

      processedChunks.push(data[0])
      console.log(`Successfully processed and stored chunk ${i + 1}`)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Chunks processed successfully', 
        processedChunks 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing chunks:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})