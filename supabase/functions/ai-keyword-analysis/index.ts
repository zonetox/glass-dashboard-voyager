import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { keywords } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Keywords array is required');
    }

    const prompt = `Analyze the following keywords and provide a comprehensive SEO keyword analysis: ${keywords.join(', ')}

Please provide a detailed response in JSON format with the following structure:

{
  "mainKeywords": ["array of main keywords provided"],
  "semanticGroups": [
    {
      "category": "category name (e.g., 'Primary Focus', 'Related Topics', 'Long-tail Variations')",
      "keywords": ["array of related keywords"],
      "intent": "search intent (informational, navigational, transactional, commercial)",
      "searchVolume": "estimated search volume category (high, medium, low)",
      "difficulty": "estimated keyword difficulty (easy, medium, hard)"
    }
  ],
  "headingDistribution": {
    "h1": ["suggested H1 tags using main keywords"],
    "h2": ["suggested H2 tags using secondary keywords"],
    "h3": ["suggested H3 tags using long-tail keywords"],
    "title": ["suggested page titles"],
    "metaDescription": ["suggested meta descriptions"]
  },
  "contentStrategy": "detailed content strategy paragraph explaining how to use these keywords effectively, content structure recommendations, and SEO best practices specific to these keywords"
}

Requirements:
- Generate 3-5 semantic keyword groups
- Each group should have 5-10 related keywords
- Provide 3-5 suggestions for each heading type
- Focus on Vietnamese market and search behavior
- Include both short-tail and long-tail keyword variations
- Consider user search intent for each keyword group
- Provide actionable content strategy recommendations

Respond only with valid JSON, no additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert SEO keyword analyst with deep knowledge of Vietnamese search behavior and semantic keyword research. Respond only with valid JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the JSON response
    let analysisResults;
    try {
      analysisResults = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate the response structure
    if (!analysisResults.mainKeywords || !analysisResults.semanticGroups || !analysisResults.headingDistribution) {
      throw new Error('Invalid response structure from AI');
    }

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-keyword-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to analyze keywords with AI'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});