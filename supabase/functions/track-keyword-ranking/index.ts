import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeywordTrackingRequest {
  domain: string;
  keywords: string[];
  target_urls?: { [keyword: string]: string };
  user_id: string;
  config_id?: string;
}

interface RankingResult {
  keyword: string;
  target_url?: string;
  current_rank: number | null;
  previous_rank?: number | null;
  search_volume?: number;
  difficulty_score?: number;
  serp_data: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const serpApiKey = Deno.env.get('SERPAPI_KEY');

async function getSERPRanking(keyword: string, domain: string): Promise<{
  rank: number | null;
  search_volume?: number;
  difficulty?: number;
  serp_data: any;
}> {
  if (!serpApiKey) {
    throw new Error('SERPAPI_KEY not configured');
  }

  try {
    const params = new URLSearchParams({
      q: keyword,
      engine: 'google',
      api_key: serpApiKey,
      location: 'Vietnam',
      hl: 'vi',
      gl: 'vn',
      num: '100' // Get top 100 results to ensure we catch the domain
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find domain ranking in organic results
    let rank = null;
    const organicResults = data.organic_results || [];
    
    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      const link = result.link || '';
      
      // Check if the domain matches (handle www and non-www)
      const resultDomain = new URL(link).hostname.replace(/^www\./, '');
      const targetDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      if (resultDomain === targetDomain) {
        rank = result.position || (i + 1);
        break;
      }
    }

    // Extract additional data if available
    const searchVolume = data.search_metadata?.total_results || 0;
    const relatedQuestions = data.related_questions || [];
    
    return {
      rank,
      search_volume: searchVolume,
      difficulty: Math.min(100, Math.max(0, Math.floor(Math.random() * 40) + 20)), // Mock difficulty for now
      serp_data: {
        total_results: data.search_metadata?.total_results,
        organic_results_count: organicResults.length,
        related_questions: relatedQuestions.slice(0, 3),
        top_3_competitors: organicResults.slice(0, 3).map((r: any) => ({
          title: r.title,
          link: r.link,
          position: r.position
        }))
      }
    };
  } catch (error) {
    console.error(`Error getting SERP ranking for "${keyword}":`, error);
    return {
      rank: null,
      serp_data: { error: error.message }
    };
  }
}

async function getPreviousRanking(userId: string, domain: string, keyword: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('current_rank')
      .eq('user_id', userId)
      .eq('domain', domain)
      .eq('keyword', keyword)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.current_rank || null;
  } catch (error) {
    console.error('Error getting previous ranking:', error);
    return null;
  }
}

async function saveRankingResults(userId: string, domain: string, results: RankingResult[]): Promise<void> {
  try {
    const rankingsToInsert = results.map(result => ({
      user_id: userId,
      domain: domain,
      keyword: result.keyword,
      target_url: result.target_url,
      current_rank: result.current_rank,
      previous_rank: result.previous_rank,
      search_volume: result.search_volume,
      difficulty_score: result.difficulty_score,
      serp_data: result.serp_data || {},
      tracked_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    }));

    const { error } = await supabase
      .from('rankings')
      .insert(rankingsToInsert);

    if (error) {
      console.error('Error saving rankings:', error);
      throw error;
    }

    console.log(`Saved ${rankingsToInsert.length} ranking results for domain: ${domain}`);
  } catch (error) {
    console.error('Error in saveRankingResults:', error);
    throw error;
  }
}

async function updateTrackingConfig(configId: string): Promise<void> {
  try {
    const now = new Date();
    const { error } = await supabase
      .from('keyword_tracking_configs')
      .update({
        last_tracked_at: now.toISOString(),
        next_track_at: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days from now
      })
      .eq('id', configId);

    if (error) {
      console.error('Error updating tracking config:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateTrackingConfig:', error);
  }
}

async function createTrackingConfig(
  userId: string, 
  domain: string, 
  keywords: string[], 
  targetUrls: { [keyword: string]: string }
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('keyword_tracking_configs')
      .insert({
        user_id: userId,
        domain: domain,
        keywords: keywords,
        target_urls: targetUrls || {},
        next_track_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString()
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating tracking config:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, keywords, target_urls, user_id, config_id }: KeywordTrackingRequest = await req.json();

    if (!domain || !keywords || keywords.length === 0 || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Domain, keywords array, and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!serpApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'SERPAPI_KEY not configured. Please add your SerpApi key to Supabase secrets.',
          setup_required: true 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting keyword tracking for domain: ${domain}, keywords: ${keywords.join(', ')}`);

    const results: RankingResult[] = [];

    // Process each keyword
    for (const keyword of keywords) {
      try {
        console.log(`Tracking keyword: ${keyword}`);
        
        // Get previous ranking for comparison
        const previousRank = await getPreviousRanking(user_id, domain, keyword);
        
        // Get current ranking from SERP API
        const serpResult = await getSERPRanking(keyword, domain);
        
        results.push({
          keyword,
          target_url: target_urls?.[keyword],
          current_rank: serpResult.rank,
          previous_rank: previousRank,
          search_volume: serpResult.search_volume,
          difficulty_score: serpResult.difficulty,
          serp_data: serpResult.serp_data
        });

        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error tracking keyword "${keyword}":`, error);
        results.push({
          keyword,
          target_url: target_urls?.[keyword],
          current_rank: null,
          previous_rank: null,
          serp_data: { error: error.message }
        });
      }
    }

    // Save results to database
    await saveRankingResults(user_id, domain, results);

    // Update or create tracking configuration
    let finalConfigId = config_id;
    if (config_id) {
      await updateTrackingConfig(config_id);
    } else {
      finalConfigId = await createTrackingConfig(user_id, domain, keywords, target_urls || {});
    }

    // Calculate summary statistics
    const trackedKeywords = results.filter(r => r.current_rank !== null);
    const improvedKeywords = results.filter(r => 
      r.current_rank !== null && r.previous_rank !== null && r.current_rank < r.previous_rank
    );
    const declinedKeywords = results.filter(r => 
      r.current_rank !== null && r.previous_rank !== null && r.current_rank > r.previous_rank
    );

    const response = {
      success: true,
      domain,
      config_id: finalConfigId,
      results,
      summary: {
        total_keywords: keywords.length,
        tracked_keywords: trackedKeywords.length,
        improved_keywords: improvedKeywords.length,
        declined_keywords: declinedKeywords.length,
        average_rank: trackedKeywords.length > 0 
          ? Math.round(trackedKeywords.reduce((sum, r) => sum + (r.current_rank || 0), 0) / trackedKeywords.length)
          : null,
        tracking_date: new Date().toISOString().split('T')[0]
      }
    };

    console.log(`Keyword tracking completed. Tracked ${trackedKeywords.length}/${keywords.length} keywords.`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in track-keyword-ranking function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});