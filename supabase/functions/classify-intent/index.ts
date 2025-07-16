import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { content, content_id } = await req.json();

    if (!content || !content_id) {
      return new Response(
        JSON.stringify({ error: 'Content and content_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Strip HTML tags and get text content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    console.log('Classifying intent for content:', textContent.substring(0, 200) + '...');

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
            content: `You are an expert at classifying search intent for web content. Analyze the content and classify it into one of these categories:

1. INFORMATIONAL: Content that provides information, answers questions, explains concepts, tutorials, guides, educational material
2. NAVIGATIONAL: Content about finding specific websites, brands, or locations (company pages, contact info, about pages)
3. TRANSACTIONAL: Content focused on completing actions like purchases, downloads, sign-ups, bookings
4. COMMERCIAL: Content comparing products/services, reviews, "best of" lists, buying guides, pricing information

Respond with ONLY a JSON object in this exact format:
{
  "intent_type": "informational|navigational|transactional|commercial",
  "confidence": 0.95,
  "reasoning": "Brief explanation for the classification"
}`
          },
          {
            role: 'user',
            content: `Classify the search intent for this content:\n\n${textContent.substring(0, 2000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    let classification;
    try {
      classification = JSON.parse(result);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', result);
      throw new Error('Invalid response format from AI');
    }

    // Validate classification
    const validIntents = ['informational', 'navigational', 'transactional', 'commercial'];
    if (!validIntents.includes(classification.intent_type)) {
      throw new Error('Invalid intent type from AI');
    }

    if (typeof classification.confidence !== 'number' || classification.confidence < 0 || classification.confidence > 1) {
      classification.confidence = 0.8; // default confidence
    }

    console.log('Classification result:', classification);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store classification in database
    const { data: intentData, error: intentError } = await supabase
      .from('content_intent')
      .upsert({
        content_id,
        intent_type: classification.intent_type,
        confidence: classification.confidence,
        generated_at: new Date().toISOString()
      }, {
        onConflict: 'content_id'
      })
      .select()
      .single();

    if (intentError) {
      console.error('Database error:', intentError);
      throw new Error('Failed to store classification result');
    }

    return new Response(
      JSON.stringify({
        intent_type: classification.intent_type,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        stored_id: intentData.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-intent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});