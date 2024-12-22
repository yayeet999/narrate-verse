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
    console.log('Starting parameter embedding generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAiKey = Deno.env.get('OPENAI_API_KEY')!;

    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openAiKey });

    // Fetch parameters that need embeddings
    const { data: parameters, error: fetchError } = await supabase
      .from('novel_parameter_references')
      .select('*')
      .is('embedding', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${parameters?.length || 0} parameters needing embeddings`);

    if (!parameters || parameters.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No parameters need embedding generation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process parameters in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < parameters.length; i += batchSize) {
      const batch = parameters.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(parameters.length / batchSize)}`);

      await Promise.all(batch.map(async (param) => {
        try {
          // Create a rich text representation of the parameter
          const paramText = `Category: ${param.category}\nKey: ${param.parameter_key}\nDescription: ${param.description}\nWeight: ${param.weight}`;
          
          // Generate embedding
          const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: paramText,
          });

          const embedding = embeddingResponse.data[0].embedding;

          // Update the parameter with its embedding
          const { error: updateError } = await supabase
            .from('novel_parameter_references')
            .update({ embedding })
            .eq('id', param.id);

          if (updateError) {
            console.error(`Error updating embedding for parameter ${param.id}:`, updateError);
          } else {
            console.log(`Successfully generated embedding for parameter ${param.id}`);
          }
        } catch (error) {
          console.error(`Error processing parameter ${param.id}:`, error);
        }
      }));

      // Add a small delay between batches to respect rate limits
      if (i + batchSize < parameters.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${parameters.length} parameters` 
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