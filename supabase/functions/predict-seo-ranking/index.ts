import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, keywords } = await req.json();

    if (!domain || !keywords || !Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: 'Domain and keywords array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Predicting SEO ranking for domain: ${domain}, keywords: ${keywords.join(', ')}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get ranking history for the keywords
    const { data: rankingHistory, error: historyError } = await supabase
      .from('rankings')
      .select('*')
      .eq('domain', domain)
      .in('keyword', keywords)
      .order('tracked_date', { ascending: false })
      .limit(100);

    if (historyError) {
      console.error('Error fetching ranking history:', historyError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch ranking history' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI analysis
    const keywordData = keywords.map(keyword => {
      const keywordHistory = rankingHistory?.filter(r => r.keyword === keyword) || [];
      return {
        keyword,
        history: keywordHistory,
        currentRank: keywordHistory[0]?.current_rank || null,
        previousRank: keywordHistory[0]?.previous_rank || null,
        searchVolume: keywordHistory[0]?.search_volume || 0,
        difficulty: keywordHistory[0]?.difficulty_score || 0
      };
    });

    // AI analysis prompt
    const prompt = `Analyze the following SEO ranking data and predict ranking changes for the next 7 days:

Domain: ${domain}
Keywords Data: ${JSON.stringify(keywordData, null, 2)}

Based on the ranking history, current positions, search volume, and difficulty scores, provide predictions for each keyword.

Consider these factors:
1. Ranking trends (improving/declining/stable)
2. Search volume vs current position
3. Keyword difficulty vs current rank
4. Recent ranking volatility
5. Content freshness needs

For each keyword, provide:
- predicted_change: number (positive for improvement, negative for decline)
- confidence: percentage (0-100)
- suggested_action: specific actionable recommendation

Return ONLY a valid JSON array in this format:
[
  {
    "keyword": "keyword1",
    "current_rank": 5,
    "predicted_change": -2,
    "confidence": 75,
    "suggested_action": "Update content with latest trends and add more internal links"
  }
]`;

    // Call OpenAI API
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
            content: 'You are an SEO expert that analyzes ranking data and provides accurate predictions. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate predictions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    let predictions;

    try {
      const content = openAIData.choices[0].message.content.trim();
      // Remove any markdown formatting
      const jsonContent = content.replace(/```json\n?|\n?```/g, '');
      predictions = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI Response:', openAIData.choices[0].message.content);
      
      // Fallback predictions based on simple analysis
      predictions = keywordData.map(kw => {
        const trend = kw.history.length > 1 ? 
          (kw.history[1].current_rank || 0) - (kw.currentRank || 0) : 0;
        
        return {
          keyword: kw.keyword,
          current_rank: kw.currentRank,
          predicted_change: Math.round(trend * 0.5),
          confidence: kw.history.length > 2 ? 60 : 30,
          suggested_action: kw.currentRank && kw.currentRank > 10 ? 
            "Optimize content and build more backlinks" : 
            "Monitor performance and maintain current strategy"
        };
      });
    }

    console.log(`Generated ${predictions.length} predictions for domain ${domain}`);

    return new Response(
      JSON.stringify({ 
        predictions,
        domain,
        analysis_date: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in predict-seo-ranking function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});