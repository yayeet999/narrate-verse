import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReferenceChunk {
  content: string
  category: string
  chunkNumber: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { chunks } = await req.json() as { chunks: ReferenceChunk[] }
    
    console.log('Received chunks:', chunks)

    if (!Array.isArray(chunks)) {
      throw new Error('Invalid chunks format')
    }

    // Insert chunks into the database
    const { data, error } = await supabaseClient
      .from('story_reference_chunks')
      .insert(
        chunks.map(chunk => ({
          chunk_number: chunk.chunkNumber,
          content: chunk.content,
          category: chunk.category
        }))
      )
      .select()

    if (error) {
      throw error
    }

    console.log('Successfully inserted chunks:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})