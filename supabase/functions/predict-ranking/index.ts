import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, keyword } = await req.json();

    if (!domain || !keyword) {
      return new Response(
        JSON.stringify({ error: 'Domain and keyword are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Predicting ranking for keyword "${keyword}" on domain "${domain}"`);

    // Simulate fetching historical data and AI regression model
    const historicalData = await fetchHistoricalData(domain, keyword);
    const prediction = await predictRankingWithAI(keyword, historicalData);

    console.log('Ranking prediction generated successfully:', prediction);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-ranking function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchHistoricalData(domain: string, keyword: string) {
  // In a real implementation, this would fetch from:
  // - Google Search Console API
  // - SEMrush API
  // - Ahrefs API
  // - Internal tracking database
  
  // Simulate historical ranking data for the past 30 days
  const days = 30;
  const historicalRankings = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate ranking fluctuation
    const baseRank = Math.floor(Math.random() * 20) + 1;
    const variation = (Math.random() - 0.5) * 4;
    const rank = Math.max(1, Math.min(100, Math.round(baseRank + variation)));
    
    historicalRankings.push({
      date: date.toISOString().split('T')[0],
      rank,
      impressions: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return historicalRankings;
}

async function predictRankingWithAI(keyword: string, historicalData: any[]) {
  // Simulate AI regression model analysis
  const currentRank = historicalData[historicalData.length - 1]?.rank || Math.floor(Math.random() * 20) + 1;
  
  // Calculate trend from historical data
  const recentRanks = historicalData.slice(-7).map(d => d.rank);
  const averageRecentRank = recentRanks.reduce((a, b) => a + b, 0) / recentRanks.length;
  const trend = currentRank - averageRecentRank;
  
  // Predict future rankings using simulated regression
  const volatility = Math.random() * 2; // Random volatility factor
  const seasonality = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 7)) * 2; // Weekly pattern
  
  const predict7d = Math.max(1, Math.min(100, Math.round(currentRank + trend * 0.5 + volatility + seasonality * 0.3)));
  const predict14d = Math.max(1, Math.min(100, Math.round(currentRank + trend * 0.8 + volatility * 1.5 + seasonality * 0.5)));
  const predict30d = Math.max(1, Math.min(100, Math.round(currentRank + trend * 1.2 + volatility * 2 + seasonality)));
  
  // Calculate confidence based on data consistency
  const rankVariance = recentRanks.reduce((acc, rank) => acc + Math.pow(rank - averageRecentRank, 2), 0) / recentRanks.length;
  const confidence = Math.max(60, Math.min(95, Math.round(100 - rankVariance * 2)));
  
  return {
    keyword,
    currentRank,
    predicted: {
      "7d": predict7d,
      "14d": predict14d,
      "30d": predict30d
    },
    confidence,
    generatedAt: new Date().toISOString(),
    historicalData: historicalData.slice(-7) // Return last 7 days for context
  };
}
