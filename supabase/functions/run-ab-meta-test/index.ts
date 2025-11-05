import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ABTestRequest {
  url: string;
  original_title?: string;
  original_description?: string;
  user_id?: string;
}

interface ABTestResponse {
  id: string;
  version_a: {
    title: string;
    description: string;
    reasoning: string;
  };
  version_b: {
    title: string;
    description: string;
    reasoning: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, original_title, original_description, user_id }: ABTestRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting A/B test creation for URL:', url);

    let title = original_title;
    let description = original_description;

    // If title/description not provided, scrape from URL
    if (!title || !description) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        
        if (!title) {
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          title = titleMatch ? titleMatch[1].trim() : '';
        }
        
        if (!description) {
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
          description = descMatch ? descMatch[1].trim() : '';
        }
      } catch (error) {
        console.error('Error scraping URL:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to scrape URL for title/description' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Could not extract title and description from URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate A/B versions using OpenAI
    const prompt = `You are an SEO expert. Create two different versions of title and meta description for A/B testing.

Original Title: "${title}"
Original Description: "${description}"
URL: ${url}

Generate 2 versions that:
1. Maintain SEO relevance and keyword focus
2. Have different emotional hooks or value propositions
3. Stay within optimal length (Title: 50-60 chars, Description: 150-160 chars)
4. Are clearly distinct from each other

Return JSON format:
{
  "version_a": {
    "title": "...",
    "description": "...",
    "reasoning": "Why this version might perform better"
  },
  "version_b": {
    "title": "...",
    "description": "...",
    "reasoning": "Why this version might perform better"
  }
}`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO expert specializing in A/B testing titles and meta descriptions. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    let versions;
    try {
      versions = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { data: abTest, error: insertError } = await supabase
      .from('ab_tests')
      .insert({
        user_id,
        url,
        original_title: title,
        original_description: description,
        version_a: versions.version_a,
        version_b: versions.version_b,
        status: 'running'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save A/B test' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('A/B test created successfully:', abTest.id);

    const response: ABTestResponse = {
      id: abTest.id,
      version_a: versions.version_a,
      version_b: versions.version_b
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in run-ab-meta-test function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});