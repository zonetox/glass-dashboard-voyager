
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
      _endpoint: 'faq-schema',
      _rate_limit: tokenData.rate_limit_per_hour
    });

    if (!canProceed.data) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record API usage
    await supabase.rpc('record_api_usage', {
      _token_id: tokenData.id,
      _user_id: tokenData.user_id,
      _endpoint: 'faq-schema'
    });

    // Generate FAQ using OpenAI
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
            content: `You are an SEO expert. Based on the given article content, generate 3-5 frequently asked questions with concise answers (1-2 sentences each). Return your response as a JSON array with this structure:
            [
              {
                "question": "What is the main topic?",
                "answer": "Concise answer in 1-2 sentences."
              }
            ]`
          },
          {
            role: 'user',
            content: `Article Content: ${content.substring(0, 3000)}...`
          }
        ],
        temperature: 0.5,
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Failed to generate FAQ');
    }

    let faqs;
    try {
      faqs = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON parsing fails
      faqs = [
        {
          question: "What is this article about?",
          answer: "This article provides comprehensive information on the topic discussed."
        }
      ];
    }

    // Generate FAQ Schema JSON-LD
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        faqs: faqs,
        schema: faqSchema,
        html_embed: `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-faq-schema:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
