import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { NOVEL_GENERATION_PROMPT } from '../../../src/lib/novel/promptTemplate.ts';

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
      '\${JSON.stringify(parameters, null, 2)}',
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