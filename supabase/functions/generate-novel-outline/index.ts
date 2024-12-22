import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const NOVEL_GENERATION_PROMPT = `You are an expert in crafting intricate and comprehensive novel outlines, capable of laying the groundwork for full-length, multi-hundred page novels. Your task is to utilize the provided user parameters, reference guide, and weighting system to produce a highly detailed and structured chapter-by-chapter outline.

# Parameter Reference Guide
[Content of parameter reference guide...]

# Weighting System
[Content of weighting system...]

# User Parameters
\${JSON.stringify(parameters, null, 2)}

# Instructions
1. Thoroughly analyze the parameter reference guide to fully comprehend the significance and potential impact of each parameter on the narrative structure.
2. Apply the weighting system meticulously to enhance the user parameters, ensuring they align with the desired story dimensions and thematic depth.
3. Use the enhanced parameters to inform the narrative's depth, focus, and complexity, ensuring a balanced and engaging storyline.
4. Construct a detailed and coherent outline that not only adheres to the user's enhanced parameters but also elevates the narrative to meet high genre standards and thematic elements.
5. Maintain consistency with genre conventions, ensuring thematic and stylistic coherence throughout the outline.
6. Generate the outline in the specified JSON format.`;

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

    const { parameters, sessionId } = await req.json();
    
    console.log('Generating novel outline with parameters:', {
      sessionId,
      parameterSummary: {
        title: parameters.title,
        genre: parameters.primaryGenre,
        length: parameters.novelLength,
        theme: parameters.primaryTheme
      }
    });

    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    const systemPrompt = NOVEL_GENERATION_PROMPT.replace(
      '${JSON.stringify(parameters, null, 2)}',
      JSON.stringify(parameters, null, 2)
    );

    const userPrompt = "Utilize the provided parameters, reference guide, and weighting system to generate a highly detailed and structured novel outline. Ensure that the outline reflects the enhanced parameters and adheres to the specified guidelines for depth, complexity, and thematic coherence.";

    console.log('Sending request to OpenAI with enhanced prompt structure');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    let responseContent = completion.choices[0].message.content;
    
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n|\n```/g, '');
    }
    
    responseContent = responseContent.trim();
    
    let outline;
    try {
      outline = JSON.parse(responseContent);
      console.log('Successfully parsed outline JSON');
    } catch (parseError) {
      console.error('Failed to parse outline JSON:', parseError);
      throw new Error(`Failed to parse outline JSON: ${parseError.message}`);
    }

    const { data: session, error: sessionError } = await supabase
      .from('story_generation_sessions')
      .select('status')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Store the generated outline
    const { error: storeError } = await supabase
      .from('story_generation_data')
      .insert({
        session_id: sessionId,
        data_type: 'outline',
        content: JSON.stringify(outline)
      });

    if (storeError) throw storeError;

    // Update session status
    const { error: updateError } = await supabase
      .from('story_generation_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    console.log('Successfully stored outline and updated session status');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-novel-outline function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});