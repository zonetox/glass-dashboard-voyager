
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userWebsiteUrl, competitorUrls, userId } = await req.json();

    // Create analysis record
    const { data: analysisRecord } = await supabase
      .from('competitor_analysis')
      .insert({
        user_id: userId,
        user_website_url: userWebsiteUrl,
        competitor_urls: competitorUrls,
        analysis_data: {},
        user_site_data: {},
        competitor_data: {},
        status: 'analyzing'
      })
      .select()
      .single();

    // Analyze user's website
    const userAnalysis = await analyzeWebsite(userWebsiteUrl);
    
    // Analyze competitors
    const competitorAnalyses = [];
    for (const url of competitorUrls) {
      const analysis = await analyzeWebsite(url);
      competitorAnalyses.push({ url, ...analysis });
    }

    // Generate AI insights
    const insights = await generateInsights(userAnalysis, competitorAnalyses, userWebsiteUrl);

    // Update analysis record
    await supabase
      .from('competitor_analysis')
      .update({
        user_site_data: userAnalysis,
        competitor_data: competitorAnalyses,
        analysis_data: {
          comparison: compareMetrics(userAnalysis, competitorAnalyses),
          recommendations: insights.recommendations
        },
        insights: insights,
        status: 'completed'
      })
      .eq('id', analysisRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysisId: analysisRecord.id,
        userSite: userAnalysis,
        competitors: competitorAnalyses,
        insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in competitor-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeWebsite(url: string) {
  try {
    // Simulate website analysis - in real implementation, you'd use web scraping
    const mockData = {
      url,
      contentCount: Math.floor(Math.random() * 1000) + 100,
      pageSpeed: {
        desktop: Math.floor(Math.random() * 40) + 60,
        mobile: Math.floor(Math.random() * 30) + 50
      },
      aiReadability: Math.floor(Math.random() * 30) + 70,
      schemas: ['Organization', 'WebSite', 'BreadcrumbList'],
      metaData: {
        title: `Sample Title for ${new URL(url).hostname}`,
        description: 'Sample meta description',
        hasH1: true,
        imageAlt: 85
      },
      technicalSEO: {
        httpsEnabled: true,
        robotsTxt: true,
        sitemap: true,
        structuredData: true
      }
    };

    return mockData;
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error);
    return null;
  }
}

function compareMetrics(userSite: any, competitors: any[]) {
  const avgCompetitor = {
    contentCount: competitors.reduce((sum, c) => sum + (c?.contentCount || 0), 0) / competitors.length,
    pageSpeed: {
      desktop: competitors.reduce((sum, c) => sum + (c?.pageSpeed?.desktop || 0), 0) / competitors.length,
      mobile: competitors.reduce((sum, c) => sum + (c?.pageSpeed?.mobile || 0), 0) / competitors.length
    },
    aiReadability: competitors.reduce((sum, c) => sum + (c?.aiReadability || 0), 0) / competitors.length
  };

  return {
    contentCount: {
      user: userSite?.contentCount || 0,
      competitors: avgCompetitor.contentCount,
      advantage: (userSite?.contentCount || 0) > avgCompetitor.contentCount ? 'user' : 'competitors'
    },
    pageSpeed: {
      desktop: {
        user: userSite?.pageSpeed?.desktop || 0,
        competitors: avgCompetitor.pageSpeed.desktop,
        advantage: (userSite?.pageSpeed?.desktop || 0) > avgCompetitor.pageSpeed.desktop ? 'user' : 'competitors'
      },
      mobile: {
        user: userSite?.pageSpeed?.mobile || 0,
        competitors: avgCompetitor.pageSpeed.mobile,
        advantage: (userSite?.pageSpeed?.mobile || 0) > avgCompetitor.pageSpeed.mobile ? 'user' : 'competitors'
      }
    },
    aiReadability: {
      user: userSite?.aiReadability || 0,
      competitors: avgCompetitor.aiReadability,
      advantage: (userSite?.aiReadability || 0) > avgCompetitor.aiReadability ? 'user' : 'competitors'
    }
  };
}

async function generateInsights(userSite: any, competitors: any[], userUrl: string) {
  if (!openAIApiKey) {
    return {
      recommendations: ['Add OpenAI API key to get AI insights'],
      strengths: [],
      weaknesses: []
    };
  }

  const prompt = `
  Analyze this competitive comparison for ${userUrl}:
  
  User Site: ${JSON.stringify(userSite, null, 2)}
  Competitors: ${JSON.stringify(competitors, null, 2)}
  
  Provide insights in JSON format with:
  - strengths: Array of user's advantages
  - weaknesses: Array of areas to improve
  - recommendations: Specific actionable advice
  - contentOpportunities: Content types to add based on competitor analysis
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a competitive SEO analyst. Provide insights in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const aiResponse = await response.json();
    const insights = JSON.parse(aiResponse.choices[0].message.content);
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      recommendations: ['Analyze competitor content strategies', 'Improve page speed performance'],
      strengths: ['Your site analysis is available'],
      weaknesses: ['Could not generate detailed insights']
    };
  }
}
