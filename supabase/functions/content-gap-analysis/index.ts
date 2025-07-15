import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentGapRequest {
  userUrl: string;
}

interface GapItem {
  topic: string;
  heading: string;
  keywords: string[];
  priority: 'high' | 'medium' | 'low';
  description: string;
  suggestedContent: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userUrl }: ContentGapRequest = await req.json();

    if (!userUrl) {
      throw new Error('URL is required');
    }

    console.log('Starting content gap analysis for:', userUrl);

    // Extract the main keyword from the URL or content
    const keywordExtractionPrompt = `
    Analyze this URL: "${userUrl}"
    Extract the main SEO keyword/topic that this page is targeting.
    Return only the main keyword phrase, nothing else.
    `;

    const keywordResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an SEO expert that extracts main keywords from URLs and content.' },
          { role: 'user', content: keywordExtractionPrompt }
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    const keywordData = await keywordResponse.json();
    const mainKeyword = keywordData.choices[0].message.content.trim();

    console.log('Extracted keyword:', mainKeyword);

    // Analyze content gaps compared to top competitors
    const gapAnalysisPrompt = `
    You are an SEO content gap expert. Analyze the content for keyword: "${mainKeyword}"

    Based on your knowledge of what top-ranking pages typically cover for this keyword, identify content gaps and missing topics that should be addressed.

    Consider:
    1. Common subtopics competitors cover
    2. Related questions users ask
    3. Missing semantic keywords
    4. Lacking depth in certain areas
    5. Missing practical examples or case studies
    6. Incomplete coverage of user intent

    Return a JSON object with the following structure:
    {
      "gaps": [
        {
          "topic": "Main topic name",
          "heading": "Suggested H2/H3 heading",
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "priority": "high|medium|low",
          "description": "Why this gap matters for SEO",
          "suggestedContent": "Brief outline of what content to add (2-3 sentences)"
        }
      ]
    }

    Find 8-12 realistic content gaps that would improve SEO performance.
    `;

    const gapResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an SEO expert that finds content gaps. Always return valid JSON.' },
          { role: 'user', content: gapAnalysisPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const gapData = await gapResponse.json();
    let gapResult;
    
    try {
      gapResult = JSON.parse(gapData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse gap analysis result:', parseError);
      // Fallback: create a simple structure
      gapResult = {
        gaps: [
          {
            topic: "Content Analysis Failed",
            heading: "Unable to analyze content gaps",
            keywords: [mainKeyword],
            priority: "medium",
            description: "The AI analysis encountered an error. Please try again.",
            suggestedContent: "Manual content review recommended."
          }
        ]
      };
    }

    console.log('Content gap analysis completed');

    return new Response(JSON.stringify({
      success: true,
      mainKeyword,
      userUrl,
      gaps: gapResult.gaps || [],
      analysisDate: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content gap analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});