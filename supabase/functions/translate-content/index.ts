import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  user_id: string;
  original_id: string;
  target_language: string;
  content: {
    title: string;
    content: string;
    meta_description?: string;
    keywords?: string[];
    url_slug?: string;
  };
  preserve_keywords?: string[];
  auto_publish?: boolean;
}

interface TranslationResponse {
  success: boolean;
  translation_id?: string;
  translated_content?: {
    title: string;
    content: string;
    meta_description: string;
    keywords: string[];
  };
  ai_quality_score?: number;
  preserved_elements?: string[];
  error?: string;
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

    const { 
      user_id, 
      original_id, 
      target_language, 
      content, 
      preserve_keywords = [], 
      auto_publish = false 
    }: TranslationRequest = await req.json();

    console.log(`Translating content to ${target_language} for user ${user_id}`);

    // Language mapping for proper names
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'vi': 'Vietnamese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai'
    };

    const targetLanguageName = languageNames[target_language] || target_language;

    // Create translation prompt with SEO preservation instructions
    const prompt = `You are an expert SEO translator. Translate the following content to ${targetLanguageName} while maintaining SEO value and context.

CRITICAL REQUIREMENTS:
1. Preserve these keywords exactly (do not translate): ${preserve_keywords.join(', ')}
2. Maintain keyword density and natural placement
3. Keep meta descriptions under 160 characters
4. Ensure content readability and natural flow
5. Preserve semantic meaning and search intent
6. Keep brand names, proper nouns, and technical terms untranslated where appropriate

Original Content:
Title: ${content.title}
Content: ${content.content}
Meta Description: ${content.meta_description || ''}
Keywords: ${content.keywords?.join(', ') || ''}

Please provide the translation in the following JSON format:
{
  "title": "translated title",
  "content": "translated content with preserved keywords and SEO structure",
  "meta_description": "translated meta description (max 160 chars)",
  "keywords": ["translated", "keywords", "array"],
  "preserved_elements": ["list", "of", "preserved", "keywords"],
  "quality_notes": "brief explanation of translation choices and SEO preservation",
  "quality_score": 0.95
}

IMPORTANT: 
- Do not translate URL slugs, brand names, or technical SEO terms
- Maintain the same content structure and formatting
- Keep keyword density similar to the original
- Ensure cultural appropriateness for the target market`;

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
              content: 'You are an expert SEO translator who maintains search optimization while providing accurate, culturally appropriate translations. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const translationContent = data.choices[0].message.content;

      let translationResult;
      try {
        translationResult = JSON.parse(translationContent);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Invalid AI response format');
      }

      // Quality validation
      if (!translationResult.title || !translationResult.content) {
        throw new Error('Incomplete translation result');
      }

      // Ensure meta_description length
      if (translationResult.meta_description && translationResult.meta_description.length > 160) {
        translationResult.meta_description = translationResult.meta_description.substring(0, 157) + '...';
      }

      // Save translation to database
      const { data: savedTranslation, error: saveError } = await supabase
        .from('translations')
        .insert({
          user_id,
          original_id,
          lang: target_language,
          translated_title: translationResult.title,
          translated_content: translationResult.content,
          translated_meta: {
            description: translationResult.meta_description,
            keywords: translationResult.keywords || [],
            quality_notes: translationResult.quality_notes,
            preserved_elements: translationResult.preserved_elements || []
          },
          ai_quality_score: Math.min(1.0, Math.max(0.0, translationResult.quality_score || 0.8)),
          status: auto_publish ? 'published' : 'draft',
          published_at: auto_publish ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving translation:', saveError);
        throw new Error('Failed to save translation');
      }

      console.log(`Translation completed for ${target_language} with quality score: ${translationResult.quality_score}`);

      return new Response(JSON.stringify({
        success: true,
        translation_id: savedTranslation.id,
        translated_content: {
          title: translationResult.title,
          content: translationResult.content,
          meta_description: translationResult.meta_description,
          keywords: translationResult.keywords || []
        },
        ai_quality_score: translationResult.quality_score,
        preserved_elements: translationResult.preserved_elements || [],
        auto_published: auto_publish,
        quality_notes: translationResult.quality_notes
      } as TranslationResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (apiError) {
      console.error('Translation API error:', apiError);
      throw new Error(`Translation failed: ${apiError.message}`);
    }

  } catch (error) {
    console.error('Error in translate-content function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    } as TranslationResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});