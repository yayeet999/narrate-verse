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

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { outline, sessionId } = await req.json();
    
    console.log('Starting outline refinement for session:', sessionId);

    const openai = new OpenAI({
      apiKey: openAiKey,
    });

    const refinementPrompt = `You are an expert novel outline refinement system. Take the provided outline and enhance it with deeper analysis and additional details. Focus on:

1. Chapter Summaries: Expand each chapter summary with rich detail about atmosphere, tension, and narrative flow
2. Plot Points: Add 2-3 additional key plot points per chapter, focusing on subtle developments and character moments
3. Character Dynamics: Analyze and detail how relationships evolve in each chapter
4. Narrative Analysis: Add a "narrativeIntensification" section tracking tension points and pacing
5. Psychological Depth: Add a "psychologicalComplexity" section exploring character motivations and internal conflicts
6. Theme Development: Track how themes evolve and interweave throughout the story
7. World Building: Add environmental and cultural details that enrich the setting

Original Outline:
${JSON.stringify(outline, null, 2)}

Provide a refined version that maintains the same core story but adds these layers of depth and detail. Return ONLY valid JSON that follows the original structure but includes the new sections.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert novel outline refinement system." },
        { role: "user", content: refinementPrompt }
      ],
      temperature: 0.7
    });

    let refinedOutline = completion.choices[0].message.content;
    
    // Clean up the response if it contains markdown code blocks
    if (refinedOutline.includes('```json')) {
      refinedOutline = refinedOutline.replace(/```json\n|\n```/g, '');
    }
    
    refinedOutline = refinedOutline.trim();
    
    // Parse to validate JSON
    const parsedOutline = JSON.parse(refinedOutline);
    console.log('Successfully parsed refined outline');

    // Store the refined outline
    const { error: storeError } = await supabase
      .from('story_generation_data')
      .update({ content: JSON.stringify(parsedOutline) })
      .eq('session_id', sessionId)
      .eq('data_type', 'outline');

    if (storeError) throw storeError;

    console.log('Successfully stored refined outline');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-novel-refinement function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});