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

    const { parameters, parameterReference, dimensions, sessionId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    const systemPrompt = `You are a professional novel outline generator. Using the provided parameters, reference guide, and calculated story dimensions, create a detailed chapter-by-chapter outline.

PARAMETER REFERENCE GUIDE:
${JSON.stringify(parameterReference, null, 2)}

STORY DIMENSIONS:
${JSON.stringify(dimensions, null, 2)}

USER PARAMETERS:
${JSON.stringify(parameters, null, 2)}

INSTRUCTIONS:
1. Use the parameter reference guide to understand the full impact and meaning of each parameter
2. Use the story dimensions to guide the depth and focus of different aspects
3. Create a detailed outline that strictly adheres to the user's chosen parameters
4. Ensure the outline maintains consistency with genre conventions and thematic elements
5. Generate an outline that follows this exact JSON structure:
{
  "chapters": [{
    "chapterNumber": number,
    "title": string,
    "summary": string,
    "scenes": [{
      "id": string,
      "sceneFocus": string,
      "conflict": string,
      "settingDetails": string,
      "characterInvolvement": string[]
    }]
  }],
  "metadata": {
    "totalEstimatedWordCount": number,
    "mainTheme": string,
    "creationTimestamp": string
  }
}`;

    const userPrompt = "Generate a detailed novel outline following the provided parameters and guidelines.";

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
    } catch (parseError) {
      throw new Error(`Failed to parse outline JSON: ${parseError.message}`);
    }

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