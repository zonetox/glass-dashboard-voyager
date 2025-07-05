
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface WriteRequest {
  topic: string;
  keyword: string;
  article_type: 'how-to' | 'product' | 'listicle' | 'guide' | 'comparison' | 'review';
  tone?: 'formal' | 'friendly' | 'professional' | 'casual' | 'authoritative';
}

interface WriteResponse {
  title: string;
  meta_description: string;
  outline: string[];
  markdown_content: string;
  html_content: string;
  schema_markup: object;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { topic, keyword, article_type, tone = 'professional' }: WriteRequest = await req.json();

    if (!topic || !keyword || !article_type) {
      throw new Error('Topic, keyword, and article type are required');
    }

    console.log('Generating article for:', { topic, keyword, article_type, tone });

    const prompt = `
Write a comprehensive ${article_type} article about "${topic}" targeting the keyword "${keyword}".

Requirements:
- Tone: ${tone}
- Article type: ${article_type}
- Target keyword: ${keyword}
- Length: 1000+ words
- SEO-optimized throughout

Generate:
1. SEO-friendly title (60 characters or less)
2. Meta description (155 characters or less)
3. Article outline with 5-7 main headings (H2 level)
4. Full article content in markdown format
5. Schema.org Article markup in JSON-LD format

For ${article_type} articles, follow these guidelines:
- How-to: Step-by-step instructions with clear progression
- Product: Features, benefits, comparisons, and recommendations
- Listicle: Numbered or bulleted list format with detailed explanations
- Guide: Comprehensive overview covering all aspects
- Comparison: Side-by-side analysis of options
- Review: In-depth evaluation with pros/cons

Ensure the content:
- Uses the target keyword naturally (2-3% density)
- Includes related keywords and semantic variations
- Has engaging subheadings
- Provides actionable value to readers
- Follows ${tone} tone throughout

Respond with a JSON object containing:
{
  "title": "SEO-optimized title",
  "meta_description": "compelling meta description",
  "outline": ["Heading 1", "Heading 2", ...],
  "markdown_content": "full article in markdown",
  "schema_markup": {JSON-LD schema object}
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content writer who creates high-quality, engaging articles optimized for search engines and user experience.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const articleData = JSON.parse(data.choices[0].message.content);

    // Convert markdown to HTML (basic conversion)
    const markdownToHtml = (markdown: string) => {
      return markdown
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/^\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
        .replace(/\n\n/gim, '</p><p>')
        .replace(/^(?!<[h|u|l])(.*)$/gim, '<p>$1</p>')
        .replace(/<p><\/p>/gim, '');
    };

    const writeResponse: WriteResponse = {
      title: articleData.title || 'Untitled Article',
      meta_description: articleData.meta_description || '',
      outline: Array.isArray(articleData.outline) ? articleData.outline : [],
      markdown_content: articleData.markdown_content || '',
      html_content: markdownToHtml(articleData.markdown_content || ''),
      schema_markup: articleData.schema_markup || {}
    };

    console.log('Article generated successfully');

    return new Response(
      JSON.stringify(writeResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Article generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate article'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
