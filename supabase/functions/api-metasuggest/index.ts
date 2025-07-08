
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
      _endpoint: 'metasuggest',
      _rate_limit: tokenData.rate_limit_per_hour
    });

    if (!canProceed.data) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record API usage
    await supabase.rpc('record_api_usage', {
      _token_id: tokenData.id,
      _user_id: tokenData.user_id,
      _endpoint: 'metasuggest'
    });

    // Generate meta suggestions using OpenAI
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
            content: `You are an SEO expert. Generate 5 different SEO-optimized title and meta description suggestions based on the given article title and content. Each title should be under 60 characters and each meta description should be under 155 characters. Return your response as a JSON array with this structure:
            [
              {
                "title": "SEO optimized title",
                "meta_description": "SEO optimized meta description",
                "focus_keyword": "main keyword"
              }
            ]`
          },
          {
            role: 'user',
            content: `Article Title: ${title}\n\nContent: ${content.substring(0, 2000)}...`
          }
        ],
        temperature: 0.7,
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Failed to generate meta suggestions');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON parsing fails
      suggestions = [
        {
          title: title.length > 60 ? title.substring(0, 57) + '...' : title,
          meta_description: `Learn about ${title.toLowerCase()}. Comprehensive guide with practical tips and insights.`,
          focus_keyword: title.split(' ').slice(0, 2).join(' ').toLowerCase()
        }
      ];
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions: suggestions,
        preview_url: `https://www.google.com/search?q=${encodeURIComponent(title)}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-metasuggest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
