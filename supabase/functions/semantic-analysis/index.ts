
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SemanticAnalysisRequest {
  url: string;
  content: string;
  user_id?: string;
}

interface SemanticAnalysisResponse {
  main_topic: string;
  missing_topics: string[];
  search_intent: string;
  entities: string[];
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
    const { url, content, user_id }: SemanticAnalysisRequest = await req.json();

    if (!url || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url, content' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Starting semantic analysis for URL: ${url}`);

    const systemPrompt = `You are an expert SEO content analyst. Your task is to analyze web content and extract semantic information that will help with SEO optimization.

Analyze the provided content and respond with a JSON object containing:
1. main_topic: A clear, concise description of the primary topic (1 line)
2. missing_topics: An array of related subtopics or semantic gaps that could improve content completeness
3. search_intent: One of "informational", "transactional", "navigational", or "commercial"
4. entities: An array of important entities like products, locations, brands, or key terms

Provide accurate, actionable insights that can help improve the content's semantic relevance and search performance.`;

    const userPrompt = `Analyze the following web content from URL: ${url}

Content:
${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}

Please provide your analysis in the exact JSON format:
{
  "main_topic": "...",
  "missing_topics": ["...", "..."],
  "search_intent": "...",
  "entities": ["...", "..."]
}`;

    console.log('Sending request to OpenAI for semantic analysis');

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
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI');

    // Parse the JSON response
    let analysisResult: SemanticAnalysisResponse;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Save to database if user_id is provided
    if (user_id) {
      console.log('Saving semantic analysis to database');
      
      const { error: dbError } = await supabase
        .from('semantic_results')
        .insert({
          url,
          user_id,
          main_topic: analysisResult.main_topic,
          missing_topics: analysisResult.missing_topics,
          search_intent: analysisResult.search_intent,
          entities: analysisResult.entities,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the entire request for DB errors, just log it
      } else {
        console.log('Semantic analysis saved to database successfully');
      }
    }

    // Log usage for monitoring
    console.log(`Semantic analysis completed for user: ${user_id || 'anonymous'}, URL: ${url}`);

    return new Response(
      JSON.stringify(analysisResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in semantic-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to perform semantic analysis',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
