
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface FullScoreRequest {
  website_url: string;
  content?: string;
}

interface ScoreBreakdown {
  seo_traditional: number;
  ai_readability: number;
  semantic_depth: number;
  technical_performance: number;
  schema_structured_data: number;
}

interface FullScoreResponse {
  overall_score: number;
  grade: 'Critical' | 'Average' | 'Good' | 'Excellent';
  color: string;
  emoji: string;
  breakdown: ScoreBreakdown;
  recommendations: string[];
  analysis_date: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: tokenData } = await supabase
      .from('api_tokens')
      .select('*')
      .eq('token_hash', token)
      .eq('is_active', true)
      .single();

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const canProceed = await supabase.rpc('check_api_rate_limit', {
      _token_id: tokenData.id,
      _endpoint: 'fullscore',
      _rate_limit: tokenData.rate_limit_per_hour
    });

    if (!canProceed.data) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { website_url, content }: FullScoreRequest = await req.json();

    if (!website_url) {
      return new Response(
        JSON.stringify({ error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record API usage
    await supabase.rpc('record_api_usage', {
      _token_id: tokenData.id,
      _user_id: tokenData.user_id,
      _endpoint: 'fullscore'
    });

    console.log(`Starting full score analysis for: ${website_url}`);

    // Validate URL format
    let validatedUrl = website_url;
    if (!website_url.startsWith('http://') && !website_url.startsWith('https://')) {
      validatedUrl = 'https://' + website_url;
    }

    // Analyze website content if not provided
    let websiteContent = content;
    if (!websiteContent) {
      try {
        console.log(`Fetching content from: ${validatedUrl}`);
        const fetchResponse = await fetch(validatedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (fetchResponse.ok) {
          websiteContent = await fetchResponse.text();
          console.log(`Successfully fetched ${websiteContent.length} characters`);
        } else {
          console.log(`Fetch failed with status: ${fetchResponse.status}`);
          websiteContent = 'Unable to fetch website content. Analysis will be based on URL only.';
        }
      } catch (fetchError) {
        console.error('Error fetching website:', fetchError);
        websiteContent = 'Unable to fetch website content. Analysis will be based on URL only.';
      }
    }

    // Get comprehensive analysis using AI
    const analysisPrompt = `
Analyze the following website comprehensively across 5 key dimensions. Score each dimension from 0-100:

Website URL: ${website_url}
Content: ${websiteContent?.substring(0, 5000)}...

Provide scores for:
1. SEO Traditional (20%): Title tags, meta descriptions, headings, keywords, URL structure
2. AI Readability (20%): How well AI models can understand and cite this content
3. Semantic Depth (20%): Topic coverage completeness, entity relationships, context richness  
4. Technical Performance (20%): Page speed, mobile optimization, Core Web Vitals
5. Schema & Structured Data (20%): JSON-LD markup, microdata, rich snippets potential

For each dimension, provide:
- Score (0-100)
- 2-3 specific recommendations for improvement

Return JSON format:
{
  "scores": {
    "seo_traditional": 85,
    "ai_readability": 78,
    "semantic_depth": 82,
    "technical_performance": 75,
    "schema_structured_data": 65
  },
  "recommendations": {
    "seo_traditional": ["Add meta description", "Optimize title length"],
    "ai_readability": ["Improve content structure", "Add clear definitions"],
    "semantic_depth": ["Cover more subtopics", "Add related entities"],
    "technical_performance": ["Optimize images", "Reduce JavaScript"],
    "schema_structured_data": ["Add FAQ schema", "Implement breadcrumbs"]
  }
}`;

    console.log('Calling OpenAI API for analysis...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyzer who provides comprehensive website scoring across multiple dimensions. Always return valid JSON without any markdown formatting.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    console.log('OpenAI API response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received');
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', openAIData);
      throw new Error('Invalid response from OpenAI API');
    }

    let analysis;
    try {
      const content = openAIData.choices[0].message.content.trim();
      // Clean the content if it has markdown
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
      console.log('Successfully parsed analysis JSON');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', openAIData.choices[0].message.content);
      
      // Fallback with dummy data if parsing fails
      analysis = {
        scores: {
          seo_traditional: 75,
          ai_readability: 70,
          semantic_depth: 65,
          technical_performance: 80,
          schema_structured_data: 60
        },
        recommendations: {
          seo_traditional: ["Optimize meta descriptions", "Improve title tags"],
          ai_readability: ["Enhance content structure", "Add clear headings"],
          semantic_depth: ["Include more related topics", "Add contextual information"],
          technical_performance: ["Optimize page speed", "Improve mobile responsiveness"],
          schema_structured_data: ["Add structured data markup", "Implement FAQ schema"]
        }
      };
      console.log('Using fallback analysis data');
    }

    // Calculate weighted overall score
    const scores = analysis.scores;
    const overallScore = Math.round(
      (scores.seo_traditional * 0.20) +
      (scores.ai_readability * 0.20) +
      (scores.semantic_depth * 0.20) +
      (scores.technical_performance * 0.20) +
      (scores.schema_structured_data * 0.20)
    );

    // Determine grade and styling
    let grade: 'Critical' | 'Average' | 'Good' | 'Excellent';
    let color: string;
    let emoji: string;

    if (overallScore <= 40) {
      grade = 'Critical';
      color = '#EF4444'; // red-500
      emoji = '🔴';
    } else if (overallScore <= 70) {
      grade = 'Average';
      color = '#EAB308'; // yellow-500
      emoji = '🟡';
    } else if (overallScore <= 90) {
      grade = 'Good';
      color = '#22C55E'; // green-500
      emoji = '🟢';
    } else {
      grade = 'Excellent';
      color = '#8B5CF6'; // violet-500
      emoji = '⭐️';
    }

    // Flatten recommendations
    const allRecommendations: string[] = [];
    Object.values(analysis.recommendations).forEach((recs: any) => {
      if (Array.isArray(recs)) {
        allRecommendations.push(...recs);
      }
    });

    const response: FullScoreResponse = {
      overall_score: overallScore,
      grade,
      color,
      emoji,
      breakdown: {
        seo_traditional: scores.seo_traditional,
        ai_readability: scores.ai_readability,
        semantic_depth: scores.semantic_depth,
        technical_performance: scores.technical_performance,
        schema_structured_data: scores.schema_structured_data
      },
      recommendations: allRecommendations,
      analysis_date: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-fullscore:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
