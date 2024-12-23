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
      console.error('OpenAI API key missing');
      throw new Error('OpenAI API key configuration missing');
    }

    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    console.log('Constructing system prompt with parameters:', {
      genre: storyParams.basicSettings.genre,
      length: storyParams.basicSettings.length,
      style: storyParams.basicSettings.writingStyle,
      worldType: storyParams.worldBuilding.worldType,
      timePeriod: storyParams.worldBuilding.timePeriod
    });

    // Calculate target token count based on length setting
    const targetTokenCount = {
      '5-10': 3000,    // Approximately 2000 words
      '10-20': 6000,   // Approximately 4000 words
      '20-30': 9000    // Approximately 6000 words
    }[storyParams.basicSettings.length] || 6000;

    console.log(`Target token count: ${targetTokenCount} tokens (approximately ${Math.floor(targetTokenCount * 0.75)} words)`);

    // Generate story content based on parameters
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative story writer. Generate a detailed story of approximately ${targetTokenCount} tokens (${Math.floor(targetTokenCount * 0.75)} words) based on these parameters:
            Genre: ${storyParams.basicSettings.genre}
            Length: ${storyParams.basicSettings.length} (aim for ${targetTokenCount} tokens)
            Writing Style: ${storyParams.basicSettings.writingStyle}
            World Type: ${storyParams.worldBuilding.worldType}
            Time Period: ${storyParams.worldBuilding.timePeriod}
            
            Additional requirements:
            - Ensure the story is properly paced and structured
            - Include rich character development
            - Maintain consistent tone and style throughout
            - Pay attention to descriptive details and world-building
            - Create engaging dialogue and interactions
            - Each major scene should be approximately 750-1500 tokens
            - Include clear scene breaks between major scenes
            - Ensure proper exposition, rising action, climax, and resolution
            
            IMPORTANT: The story MUST be at least ${targetTokenCount * 0.9} tokens long. Do not end the story prematurely.`
        },
        {
          role: "user",
          content: storyParams.customInstructions || "Write a story following the given parameters, ensuring it meets the target length and incorporates all specified elements."
        }
      ],
      temperature: 0.7,
      max_tokens: targetTokenCount + 500, // Add buffer for system message
    });

    const content = completion.choices[0].message.content;
    const tokenCount = content.split(/\s+/).length * 1.33; // Rough estimation of tokens
    
    console.log(`Generated story statistics:`, {
      estimatedTokenCount: Math.floor(tokenCount),
      targetTokenCount: targetTokenCount,
      difference: Math.floor(tokenCount - targetTokenCount),
      percentageOfTarget: Math.round((tokenCount / targetTokenCount) * 100)
    });

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