import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RewriteRequest {
  url: string;
  contentType: 'title' | 'meta_description' | 'h1' | 'h2' | 'paragraph' | 'alt_text';
  originalContent: string;
  context?: string; // Additional context from the page
  targetKeywords?: string[];
  user_id?: string;
}

async function analyzeWebsiteForContext(url: string): Promise<{ context: string; keywords: string[] }> {
  try {
    console.log(`Fetching website context from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Content-Rewriter/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title and meta description for context
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    
    // Extract h1-h3 for context
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    
    const title = titleMatch ? titleMatch[1].trim() : '';
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';
    const headings = [
      ...h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      ...h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim())
    ].slice(0, 10);

    // Extract text content for keyword analysis
    const textContent = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
                           .replace(/<style[^>]*>.*?<\/style>/gis, '')
                           .replace(/<[^>]*>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();

    // Simple keyword extraction
    const words = textContent.toLowerCase()
                             .split(/\s+/)
                             .filter(word => word.length > 4 && !/^\d+$/.test(word))
                             .slice(0, 1000); // Limit for analysis

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const topKeywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    const context = `
Website: ${url}
Title: ${title}
Meta Description: ${metaDesc}
Main Headings: ${headings.join(', ')}
Industry/Topic: ${topKeywords.slice(0, 3).join(', ')}
`.trim();

    return { context, keywords: topKeywords };

  } catch (error) {
    console.error(`Error analyzing website ${url}:`, error);
    return { context: `Website: ${url}`, keywords: [] };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== AI CONTENT REWRITER STARTED ===');
  
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, contentType, originalContent, context, targetKeywords, user_id }: RewriteRequest = await req.json();

    if (!url || !contentType || !originalContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url, contentType, originalContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Rewriting ${contentType} for ${url}`);

    // Get website context if not provided
    let websiteContext = context;
    let keywords = targetKeywords || [];
    
    if (!websiteContext) {
      const analysis = await analyzeWebsiteForContext(url);
      websiteContext = analysis.context;
      keywords = keywords.length > 0 ? keywords : analysis.keywords;
    }

    // Log API usage
    if (user_id) {
      await supabase.from('api_logs').insert({
        api_name: 'ai-content-rewriter',
        endpoint: '/ai-content-rewriter',
        user_id,
        domain: new URL(url).hostname,
        method: 'POST',
        request_payload: { contentType, originalContent: originalContent.substring(0, 100) },
        success: true,
        created_at: new Date().toISOString()
      });
    }

    // Content type specific prompts and constraints
    const contentSpecs = {
      title: {
        maxLength: 60,
        minLength: 30,
        instruction: "Tạo title tag SEO tối ưu, hấp dẫn, chứa từ khóa chính và khuyến khích click."
      },
      meta_description: {
        maxLength: 160,
        minLength: 120,
        instruction: "Viết meta description hấp dẫn, tóm tắt nội dung, có call-to-action rõ ràng."
      },
      h1: {
        maxLength: 100,
        minLength: 20,
        instruction: "Viết lại tiêu đề H1 thu hút, SEO-friendly, thể hiện rõ chủ đề chính."
      },
      h2: {
        maxLength: 80,
        minLength: 15,
        instruction: "Tạo tiêu đề H2 logic, hỗ trợ cấu trúc nội dung và chứa từ khóa phụ."
      },
      paragraph: {
        maxLength: 500,
        minLength: 50,
        instruction: "Viết lại đoạn văn tự nhiên, dễ đọc, SEO-friendly và có giá trị cho người dùng."
      },
      alt_text: {
        maxLength: 125,
        minLength: 10,
        instruction: "Tạo alt text mô tả chính xác hình ảnh, hỗ trợ accessibility và SEO."
      }
    };

    const spec = contentSpecs[contentType];

    const systemPrompt = `Bạn là chuyên gia SEO và copywriter chuyên nghiệp. Nhiệm vụ của bạn là viết lại nội dung để:

1. Tối ưu SEO và tăng thứ hạng Google
2. Thu hút người dùng và tăng CTR
3. Cải thiện trải nghiệm đọc
4. Sử dụng từ khóa tự nhiên, không spam

NGUYÊN TẮC QUAN TRỌNG:
- Nội dung phải TỰ NHIÊN và có GIÁ TRỊ THỰC
- KHÔNG sử dụng template chung hoặc câu chữ sáo rỗng
- Phân tích context website để viết phù hợp với ngành/lĩnh vực
- Đảm bảo độ dài phù hợp: ${spec.minLength}-${spec.maxLength} ký tự`;

    const userPrompt = `${spec.instruction}

THÔNG TIN WEBSITE:
${websiteContext}

TỪ KHÓA MỤC TIÊU: ${keywords.join(', ')}

NỘI DUNG GỐC CẦN VIẾT LẠI:
"${originalContent}"

YÊU CẦU:
- Độ dài: ${spec.minLength}-${spec.maxLength} ký tự
- Phải phù hợp với ngành/lĩnh vực của website
- Tự nhiên, không rời rạc hay template
- Chứa từ khóa phù hợp
- Hấp dẫn người dùng thực tế

Trả về JSON với các trường:
{
  "rewritten_content": "Nội dung đã viết lại",
  "improvements": ["Cải thiện 1", "Cải thiện 2", "Cải thiện 3"],
  "seo_score": "8/10",
  "character_count": 45,
  "keywords_used": ["keyword1", "keyword2"]
}`;

    console.log('Calling OpenAI for content rewriting...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI');

    // Parse AI response
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn('AI response not in JSON format, creating structured response');
      result = {
        rewritten_content: aiResponse.trim(),
        improvements: ["Cải thiện độ hấp dẫn", "Tối ưu từ khóa", "Cải thiện cấu trúc"],
        seo_score: "7/10",
        character_count: aiResponse.trim().length,
        keywords_used: keywords.slice(0, 3)
      };
    }

    // Add metadata
    result.original_content = originalContent;
    result.content_type = contentType;
    result.timestamp = new Date().toISOString();
    result.url = url;

    console.log('=== CONTENT REWRITING COMPLETED ===');
    console.log('Result summary:', {
      contentType,
      originalLength: originalContent.length,
      rewrittenLength: result.rewritten_content?.length,
      seoScore: result.seo_score
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== AI CONTENT REWRITER ERROR ===', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to rewrite content',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});