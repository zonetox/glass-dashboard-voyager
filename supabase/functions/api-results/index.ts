
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
    
    // Verify token
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
      _endpoint: 'results',
      _rate_limit: tokenData.rate_limit_per_hour
    });

    if (!canProceed.data) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const websiteUrl = url.searchParams.get('url');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Record API usage
    await supabase.rpc('record_api_usage', {
      _token_id: tokenData.id,
      _user_id: tokenData.user_id,
      _endpoint: 'results'
    });

    // Get scan results
    let query = supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', tokenData.user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (websiteUrl) {
      query = query.eq('website_url', websiteUrl);
    }

    const { data: results, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: results || [],
        count: results?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
