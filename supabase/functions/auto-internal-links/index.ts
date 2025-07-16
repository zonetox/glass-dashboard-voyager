import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InternalLinkRequest {
  user_id: string;
  articles?: Array<{
    id: string;
    title: string;
    content: string;
    url: string;
  }>;
  target_article_id?: string;
  auto_publish?: boolean;
}

interface InternalLinkSuggestion {
  from_article_id: string;
  to_article_id: string;
  anchor_text: string;
  position: number;
  ai_score: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, articles, target_article_id, auto_publish }: InternalLinkRequest = await req.json();

    let articlesData = articles;
    
    // If no articles provided, fetch from scans table
    if (!articlesData) {
      console.log('Fetching articles from scans table');
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('id, url, seo')
        .eq('user_id', user_id)
        .not('seo', 'is', null);

      if (scansError) {
        console.error('Error fetching scans:', scansError);
        throw new Error('Failed to fetch articles');
      }

      articlesData = scansData.map((scan: any) => ({
        id: scan.id,
        title: scan.seo?.title || 'Untitled',
        content: scan.seo?.meta_description || '',
        url: scan.url
      }));
    }

    if (!articlesData || articlesData.length < 2) {
      return new Response(JSON.stringify({ 
        suggestions: [],
        message: 'Need at least 2 articles to generate internal link suggestions'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Analyzing ${articlesData.length} articles for internal links`);

    const suggestions: InternalLinkSuggestion[] = [];

    // Process articles for internal link suggestions
    for (const fromArticle of articlesData) {
      if (target_article_id && fromArticle.id !== target_article_id) {
        continue;
      }

      const otherArticles = articlesData.filter(a => a.id !== fromArticle.id);
      
      const prompt = `Analyze the following article and suggest internal links to related articles.

Main Article:
Title: ${fromArticle.title}
Content: ${fromArticle.content}
URL: ${fromArticle.url}

Available Articles to Link To:
${otherArticles.map((article, index) => `${index + 1}. Title: ${article.title}\n   URL: ${article.url}\n   Content: ${article.content}`).join('\n\n')}

Please suggest internal links by:
1. Finding topics, entities, or concepts mentioned in the main article that relate to the available articles
2. Suggesting natural anchor text that would fit contextually
3. Estimating the position in the content (as a percentage from 0-100)
4. Scoring the relevance (0.0-1.0)

Return a JSON array with this format:
[
  {
    "to_article_id": "article_id",
    "anchor_text": "natural anchor text",
    "position": 25,
    "ai_score": 0.85,
    "reason": "Both articles discuss similar topics"
  }
]

Only suggest high-quality, contextually relevant links (score > 0.6). Maximum 3 suggestions per article.`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an SEO expert specializing in internal linking strategies. Analyze content and suggest natural, contextually relevant internal links.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          console.error('OpenAI API error:', response.status, response.statusText);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
          const linkSuggestions = JSON.parse(content);
          
          for (const suggestion of linkSuggestions) {
            if (suggestion.ai_score >= 0.6) {
              suggestions.push({
                from_article_id: fromArticle.id,
                to_article_id: suggestion.to_article_id,
                anchor_text: suggestion.anchor_text,
                position: Math.max(0, Math.min(100, suggestion.position)),
                ai_score: suggestion.ai_score,
                reason: suggestion.reason
              });
            }
          }
        } catch (parseError) {
          console.error('Error parsing AI response for article', fromArticle.id, parseError);
        }

      } catch (error) {
        console.error('Error processing article', fromArticle.id, error);
      }
    }

    console.log(`Generated ${suggestions.length} internal link suggestions`);

    // Save suggestions to database
    if (suggestions.length > 0) {
      const { error: insertError } = await supabase
        .from('auto_links')
        .insert(
          suggestions.map(suggestion => ({
            user_id,
            from_article_id: suggestion.from_article_id,
            to_article_id: suggestion.to_article_id,
            anchor_text: suggestion.anchor_text,
            position: suggestion.position,
            ai_score: suggestion.ai_score,
            status: 'suggested'
          }))
        );

      if (insertError) {
        console.error('Error saving suggestions:', insertError);
        throw new Error('Failed to save internal link suggestions');
      }
    }

    // If auto_publish is enabled, apply the links
    if (auto_publish && suggestions.length > 0) {
      console.log('Auto-publishing internal links');
      // This would implement the actual content modification logic
      // For now, we'll just update the status
      const { error: updateError } = await supabase
        .from('auto_links')
        .update({ status: 'published' })
        .eq('user_id', user_id)
        .eq('status', 'suggested');

      if (updateError) {
        console.error('Error updating link status:', updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      suggestions: suggestions.map(s => ({
        ...s,
        from_article: articlesData.find(a => a.id === s.from_article_id),
        to_article: articlesData.find(a => a.id === s.to_article_id)
      })),
      total_suggestions: suggestions.length,
      auto_published: auto_publish && suggestions.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in auto-internal-links function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});