import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

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
    const { storyParams } = await req.json();
    console.log('Received story parameters:', JSON.stringify(storyParams, null, 2));

    // Validate API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key configuration missing');
    }

    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    // Generate story content based on parameters
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative story writer. Generate a story based on these parameters:
            Genre: ${storyParams.basicSettings.genre}
            Length: ${storyParams.basicSettings.length}
            Writing Style: ${storyParams.basicSettings.writingStyle}
            World Type: ${storyParams.worldBuilding.worldType}
            Time Period: ${storyParams.worldBuilding.timePeriod}`
        },
        {
          role: "user",
          content: storyParams.customInstructions || "Write a story following the given parameters."
        }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    console.log('Generated content successfully');

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});