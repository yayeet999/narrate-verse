import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import axios from 'npm:axios'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate request body
    const { blogParams } = await req.json()
    console.log('Received blog parameters:', JSON.stringify(blogParams, null, 2))

    // Validate API key
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')
    if (!PERPLEXITY_API_KEY) {
      throw new Error('API key configuration missing')
    }

    // Validate blog parameters
    if (!blogParams?.type || !blogParams?.length || !blogParams?.targetAudience) {
      console.error('Missing required blog parameters:', blogParams)
      throw new Error('Missing required blog parameters')
    }

    // Validate content style parameters
    const contentStyle = blogParams.contentStyle || {}
    const technicalLevel = contentStyle.technicalLevel || 3
    const tone = contentStyle.tone || 3
    const detailLevel = contentStyle.detailLevel || 3

    console.log('Content style parameters:', { technicalLevel, tone, detailLevel })

    // Helper functions with safe fallbacks
    const getTechnicalLevel = (level: number) => {
      const levels = ['very casual', 'casual', 'balanced', 'technical', 'very technical']
      return levels[Math.min(Math.max(0, level - 1), levels.length - 1)] || 'balanced'
    }

    const getTone = (level: number) => {
      const tones = ['very conversational', 'conversational', 'balanced', 'professional', 'very professional']
      return tones[Math.min(Math.max(0, level - 1), tones.length - 1)] || 'balanced'
    }

    const getDetailLevel = (level: number) => {
      const details = ['brief overview', 'general overview', 'moderate detail', 'detailed', 'very detailed']
      return details[Math.min(Math.max(0, level - 1), details.length - 1)] || 'moderate detail'
    }

    // Construct prompts with validated parameters
    const systemPrompt = `You are a professional blog writer. Create a ${blogParams.length} word ${blogParams.type.replace(/_/g, ' ')} 
that is ${getTechnicalLevel(technicalLevel)} in technical depth,
${getTone(tone)} in tone, and ${getDetailLevel(detailLevel)} in detail level.
The content is aimed at a ${blogParams.targetAudience} audience.

Additional requirements:
${blogParams.options?.includeStatistics ? '- Include relevant statistics and data\n' : ''}
${blogParams.options?.addExpertQuotes ? '- Include quotes from industry experts\n' : ''}
${blogParams.options?.includeExamples ? '- Include real-world examples\n' : ''}
${blogParams.options?.addVisualElements ? '- Suggest places for images or diagrams\n' : ''}
${blogParams.options?.seoOptimization ? '- Optimize content for search engines\n' : ''}

First, thoroughly research the topic and cite your sources. Then write the blog post based on your research.`

    const userPrompt = `Research and write a blog post about: ${blogParams.customInstructions || 'Write an informative blog post.'}`

    console.log('Making API request with prompts:', {
      systemPrompt,
      userPrompt,
      model: "llama-3.1-sonar-small-128k-online"
    })

    // Make API request with proper error handling
    try {
      const response = await axios.post(
        PERPLEXITY_API_URL,
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 30,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('API response received successfully')
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Perplexity API')
      }

      return new Response(
        JSON.stringify({ content: response.data.choices[0].message.content }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (apiError: any) {
      console.error('API Error:', {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status
      })
      
      throw new Error(`Perplexity API error: ${apiError.response?.data?.error || apiError.message}`)
    }

  } catch (error: any) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response?.data || 'No additional details available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})