import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUserPlanLimit, incrementUserUsage, getUserIdFromRequest } from "../_shared/plan-utils.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewriteRequest {
  type: 'meta_title' | 'meta_desc' | 'h1' | 'alt_text' | 'paragraph';
  url: string;
  original_content: string;
  user_id?: string;
}

interface RewriteResponse {
  suggestion: string;
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not configured');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { type, url, original_content, user_id }: RewriteRequest = await req.json();

    if (!type || !url || !original_content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, url, original_content' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check user plan limits for AI rewrite feature
    const actualUserId = user_id || await getUserIdFromRequest(req);
    if (actualUserId) {
      console.log(`Checking AI rewrite plan limits for user: ${actualUserId}`);
      const planCheck = await checkUserPlanLimit(actualUserId, 'ai');
      
      if (!planCheck.allowed) {
        return new Response(
          JSON.stringify({ 
            error: planCheck.error,
            plan: planCheck.plan,
            limitExceeded: true,
            featureRequired: 'ai'
          }), 
          { 
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      console.log(`AI plan check passed for user: ${actualUserId}, remaining: ${planCheck.plan?.remaining_count}`);
    }

    // Create type-specific prompts
    const typePrompts = {
      meta_title: "Create an SEO-optimized meta title (50-60 characters) that is compelling, includes relevant keywords, and encourages clicks.",
      meta_desc: "Write an engaging meta description (150-160 characters) that summarizes the content, includes keywords, and has a clear call-to-action.",
      h1: "Rewrite this H1 heading to be more engaging, SEO-friendly, and clearly communicate the main topic while including relevant keywords.",
      alt_text: "Create descriptive alt text that accurately describes the image for accessibility and SEO, keeping it concise but informative.",
      paragraph: "Rewrite this paragraph to be more engaging, readable, and SEO-optimized while maintaining the original meaning and adding relevant keywords naturally."
    };

    const systemPrompt = `You are an expert SEO content writer. Your task is to rewrite content to improve SEO performance, user engagement, and keyword relevance while maintaining readability and authenticity.

Guidelines:
- Keep content natural and user-focused
- Avoid keyword stuffing
- Maintain the original intent and meaning
- Use clear, engaging language
- Follow SEO best practices for the content type
- Provide a brief reasoning for your rewrite`;

    const userPrompt = `${typePrompts[type]}

Original content: "${original_content}"
Website URL: ${url}

Please provide:
1. The rewritten content
2. A brief explanation of the changes made

Format your response as JSON with "suggestion" and "reasoning" fields.`;

    console.log('Sending request to OpenAI for content rewrite');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI');

    // Try to parse JSON response
    let result: RewriteResponse;
    try {
      result = JSON.parse(aiResponse);
    } catch (parseError) {
      // If AI didn't return valid JSON, extract content manually
      console.log('AI response not in JSON format, parsing manually');
      result = {
        suggestion: aiResponse.split('\n')[0] || aiResponse,
        reasoning: "Content rewritten for improved SEO and user engagement"
      };
    }

    // Increment usage count after successful AI rewrite
    if (actualUserId) {
      const usageIncremented = await incrementUserUsage(actualUserId);
      if (usageIncremented) {
        console.log(`Usage incremented for AI rewrite, user: ${actualUserId}`);
      } else {
        console.error(`Failed to increment usage for AI rewrite, user: ${actualUserId}`);
      }
    }

    // Log usage for monitoring
    console.log(`Content rewrite completed for user: ${user_id || 'anonymous'}, type: ${type}, url: ${url}`);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in rewrite-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to rewrite content',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});