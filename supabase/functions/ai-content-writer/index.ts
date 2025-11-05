import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, language, user_id, content_type = 'blog', word_count = 1500 } = await req.json();

    if (!keyword || !language || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Keyword, language, and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${language} content for keyword: ${keyword}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get language-specific prompts
    const languageConfig = getLanguageConfig(language);
    
    // Step 1: Generate outline
    const outlinePrompt = `
Create a detailed outline for a ${content_type} article about "${keyword}" in ${languageConfig.name}.

Requirements:
- Target language: ${languageConfig.name} (${language})
- Content type: ${content_type}
- Target word count: ${word_count} words
- SEO optimized
- Include H1, H2, H3 structure
- Add meta description and title suggestions

Format as JSON:
{
  "title": "Suggested title",
  "meta_title": "SEO title (max 60 chars)",
  "meta_description": "SEO description (max 160 chars)",
  "outline": [
    {
      "level": "h1",
      "title": "Main title",
      "content_points": ["point 1", "point 2"]
    },
    {
      "level": "h2", 
      "title": "Section title",
      "content_points": ["point 1", "point 2"]
    }
  ],
  "suggested_tags": ["tag1", "tag2"],
  "estimated_word_count": 1500
}`;

    // Generate outline
    const outlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert content writer specializing in ${languageConfig.name} content. Create detailed, SEO-optimized outlines.`
          },
          {
            role: 'user',
            content: outlinePrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!outlineResponse.ok) {
      console.error('OpenAI outline API error:', await outlineResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate outline' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const outlineData = await outlineResponse.json();
    let outline;

    try {
      const outlineContent = outlineData.choices[0].message.content.trim();
      const jsonContent = outlineContent.replace(/```json\n?|\n?```/g, '');
      outline = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing outline:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse outline' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Generate full content based on outline
    const contentPrompt = `
Write a complete ${content_type} article in ${languageConfig.name} based on this outline:

Keyword: ${keyword}
Title: ${outline.title}
Target word count: ${word_count} words

Outline:
${JSON.stringify(outline.outline, null, 2)}

Requirements:
- Write in fluent, native ${languageConfig.name}
- Use proper HTML structure (h1, h2, h3, p, ul, ol)
- Include the keyword naturally throughout
- Make it engaging and informative
- Add relevant examples and details
- Optimize for SEO while maintaining readability
- Include a compelling introduction and conclusion

Return only the HTML content (without <html>, <head>, or <body> tags).`;

    // Generate content
    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert content writer creating high-quality ${languageConfig.name} content. Focus on natural, engaging writing that provides real value to readers.`
          },
          {
            role: 'user',
            content: contentPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!contentResponse.ok) {
      console.error('OpenAI content API error:', await contentResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentData = await contentResponse.json();
    const fullContent = contentData.choices[0].message.content.trim();

    // Calculate metrics
    const wordCount = fullContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    const aiScore = calculateAIScore(fullContent, keyword);

    // Generate slug
    const slug = generateSlug(outline.title, language);

    // Save to database
    const { data: post, error: dbError } = await supabase
      .from('posts')
      .insert({
        user_id,
        title: outline.title,
        content: fullContent,
        excerpt: generateExcerpt(fullContent),
        keyword,
        language,
        slug,
        meta_title: outline.meta_title,
        meta_description: outline.meta_description,
        tags: outline.suggested_tags || [],
        categories: [content_type],
        outline: outline.outline,
        ai_score: aiScore,
        word_count: wordCount,
        reading_time: readingTime,
        status: 'draft'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save post' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created ${language} post: ${outline.title} (${wordCount} words)`);

    return new Response(
      JSON.stringify({ 
        post,
        outline,
        metrics: {
          word_count: wordCount,
          reading_time: readingTime,
          ai_score: aiScore
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-content-writer function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getLanguageConfig(language: string) {
  const configs: { [key: string]: { name: string; rtl: boolean } } = {
    'vi': { name: 'Vietnamese', rtl: false },
    'en': { name: 'English', rtl: false },
    'fr': { name: 'French', rtl: false },
    'es': { name: 'Spanish', rtl: false },
    'de': { name: 'German', rtl: false },
    'it': { name: 'Italian', rtl: false },
    'pt': { name: 'Portuguese', rtl: false },
    'ja': { name: 'Japanese', rtl: false },
    'ko': { name: 'Korean', rtl: false },
    'zh': { name: 'Chinese', rtl: false },
    'ru': { name: 'Russian', rtl: false },
    'ar': { name: 'Arabic', rtl: true },
    'hi': { name: 'Hindi', rtl: false },
    'th': { name: 'Thai', rtl: false }
  };
  
  return configs[language] || { name: 'English', rtl: false };
}

function generateSlug(title: string, language: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Add language prefix if not Vietnamese
  if (language !== 'vi') {
    slug = `${language}-${slug}`;
  }
  
  return slug;
}

function generateExcerpt(content: string): string {
  // Extract first paragraph, remove HTML tags
  const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/)?.[1] || '';
  const textOnly = firstParagraph.replace(/<[^>]*>/g, '');
  
  // Limit to 160 characters
  if (textOnly.length <= 160) return textOnly;
  
  const truncated = textOnly.substring(0, 157);
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

function calculateAIScore(content: string, keyword: string): number {
  let score = 60; // Base score
  
  // Check keyword usage
  const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  if (keywordCount >= 3 && keywordCount <= 8) score += 10;
  
  // Check content structure
  if (content.includes('<h1>')) score += 5;
  if (content.includes('<h2>')) score += 5;
  if (content.includes('<ul>') || content.includes('<ol>')) score += 5;
  
  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 800) score += 10;
  if (wordCount >= 1500) score += 5;
  
  return Math.min(score, 100);
}