import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  topic: string;
  heading: string;
  keywords: string[];
  mainKeyword: string;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { topic, heading, keywords, mainKeyword, description }: GenerateContentRequest = await req.json();

    if (!topic || !heading) {
      throw new Error('Topic and heading are required');
    }

    console.log('Generating content for gap topic:', topic);

    const contentPrompt = `
    You are an expert SEO content writer in Vietnamese. Generate a detailed content section for:

    Main Keyword: "${mainKeyword}"
    Section Topic: "${topic}"
    Suggested Heading: "${heading}"
    Related Keywords: ${keywords.join(', ')}
    Purpose: ${description}

    Generate a complete section (200-400 words) that:
    1. Uses the suggested heading as H2 or H3
    2. Naturally incorporates the related keywords
    3. Provides valuable, actionable information
    4. Maintains Vietnamese language throughout
    5. Uses proper SEO structure with subheadings if needed
    6. Includes practical examples or tips where appropriate

    Format as markdown with proper headings.
    Make it ready to insert into an existing article.
    `;

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
            content: 'You are an expert Vietnamese SEO content writer who creates high-quality, engaging content sections that fill content gaps and improve SEO performance.' 
          },
          { role: 'user', content: contentPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Gap content generated successfully');

    return new Response(JSON.stringify({
      success: true,
      topic,
      heading,
      content: generatedContent,
      wordCount: generatedContent.split(' ').length,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating gap content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});