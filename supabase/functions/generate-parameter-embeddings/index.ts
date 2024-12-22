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
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    // Get parameters without embeddings
    console.log('Fetching parameters without embeddings...');
    const { data: parameters, error: fetchError } = await supabase
      .from('novel_parameter_references')
      .select('*')
      .is('embedding', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${parameters?.length || 0} parameters without embeddings`);

    // Process each parameter
    for (const param of parameters || []) {
      const text = `${param.category} parameter: ${param.parameter_key}
Description: ${param.description}
Weight: ${param.weight}`;

      console.log(`Generating embedding for parameter: ${param.parameter_key}`);
      
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      const embedding = embeddingResponse.data[0].embedding;
      
      // Update the parameter with its embedding
      const { error: updateError } = await supabase
        .from('novel_parameter_references')
        .update({ embedding: embedding })
        .eq('id', param.id);

      if (updateError) {
        console.error(`Error updating parameter ${param.id}:`, updateError);
        continue;
      }

      console.log(`Successfully updated embedding for parameter: ${param.parameter_key}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${parameters?.length || 0} parameters` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-parameter-embeddings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});