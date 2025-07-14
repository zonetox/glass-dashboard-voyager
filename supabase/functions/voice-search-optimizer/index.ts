import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, url, optimizationType } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!content || !optimizationType) {
      throw new Error('Content and optimization type are required');
    }

    let prompt = '';
    
    if (optimizationType === 'schema') {
      prompt = `Analyze this content and suggest voice search optimization schemas for Vietnamese market:

Content: ${content}
URL: ${url}

Generate schemas in JSON format:
{
  "faqSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question", 
        "name": "question here",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "concise answer"
        }
      }
    ]
  },
  "speakableSchema": {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": [".speakable-content"],
    "xpath": ["//div[@class='speakable-content']"]
  },
  "articleSchema": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "optimized for voice",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".voice-answer"]
    }
  }
}`;
    } else if (optimizationType === 'rewrite') {
      prompt = `Rewrite this content to be optimized for voice search in Vietnamese:

Original content: ${content}

Requirements:
- Use natural, conversational language
- Answer common questions directly
- Use long-tail keywords people speak
- Structure for featured snippets
- Include "Câu trả lời ngắn" sections

Return JSON format:
{
  "voiceOptimizedContent": "rewritten content here",
  "shortAnswers": ["answer 1", "answer 2"],
  "questionAnswerPairs": [
    {"question": "question here", "answer": "direct answer"}
  ],
  "speakableSegments": ["segment optimized for voice"]
}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a Vietnamese voice search SEO expert. Provide structured JSON responses only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice-search-optimizer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to optimize for voice search'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});