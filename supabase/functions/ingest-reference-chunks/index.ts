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
    console.log('=== Edge Function: Ingest Reference Chunks ===');
    
    // Get the request body and log it
    const requestText = await req.text();
    console.log('Raw request body:', requestText);
    
    let body;
    try {
      body = JSON.parse(requestText);
      console.log('Parsed request body:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid JSON in request body');
    }

    // Validate chunks array exists
    if (!body.chunks) {
      console.error('No chunks array in request body');
      throw new Error('No chunks array provided');
    }

    const { chunks } = body as { chunks: ReferenceChunk[] };
    
    // Validate chunks is an array
    if (!Array.isArray(chunks)) {
      console.error('Invalid chunks format received');
      throw new Error('Invalid chunks format: not an array');
    }

    // Validate each chunk
    chunks.forEach((chunk, index) => {
      console.log(`Validating chunk ${index}:`, {
        hasContent: !!chunk.content,
        contentLength: chunk.content?.length,
        category: chunk.category,
        chunkNumber: chunk.chunkNumber
      });

      if (!chunk.content || !chunk.category || typeof chunk.chunkNumber !== 'number') {
        console.error(`Invalid chunk at index ${index}:`, chunk);
        throw new Error(`Invalid chunk format at index ${index}`);
      }
    });

    console.log('All chunks validated successfully');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Attempting database insertion...');

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
      console.error('Database error:', error);
      throw error;
    }

    console.log('Successfully inserted chunks:', data);

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
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response?.data || 'No additional details available'
      }),
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