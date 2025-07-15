import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  keyword: string;
  intent: string;
  additionalTopic?: string;
}

interface ContentResponse {
  title: string;
  metaDescription: string;
  article: string;
  wordCount: number;
  generatedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let userId: string | null = null;
  let logData: any = {};

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { keyword, intent, additionalTopic }: ContentRequest = await req.json();

    if (!keyword || !intent) {
      throw new Error('Keyword and intent are required');
    }

    console.log('Generating content for keyword:', keyword, 'with intent:', intent);

    // Store log data
    logData = {
      keyword: keyword.trim(),
      intent,
      user_id: userId,
    };

    // Create detailed content generation prompt based on intent
    const intentInstructions = {
      informational: `
        - Tập trung vào việc cung cấp thông tin chi tiết, hướng dẫn cụ thể
        - Sử dụng heading để chia nhỏ thông tin dễ đọc
        - Thêm tips, lưu ý, bước thực hiện chi tiết
        - CTA: khuyến khích đọc thêm, chia sẻ, theo dõi
      `,
      transactional: `
        - Tập trung vào benefits của sản phẩm/dịch vụ
        - Thêm so sánh, review, đánh giá
        - Highlight USP và call-to-action mạnh mẽ
        - CTA: mua ngay, đặt hàng, liên hệ
      `,
      commercial: `
        - So sánh nhiều lựa chọn, pros/cons
        - Thêm bảng so sánh, pricing, features
        - Advice về cách chọn lựa phù hợp
        - CTA: xem thêm sản phẩm, tư vấn miễn phí
      `,
      navigational: `
        - Hướng dẫn tìm kiếm, truy cập
        - Thông tin về brand, company, service
        - Địa chỉ, contact, liên kết official
        - CTA: truy cập website, liên hệ trực tiếp
      `
    };

    const contentPrompt = `
    Bạn là chuyên gia viết content SEO tiếng Việt hàng đầu. Hãy viết một bài viết HOÀN CHỈNH cho từ khóa: "${keyword}"

    SEARCH INTENT: ${intent}
    ${intentInstructions[intent as keyof typeof intentInstructions] || ''}

    CHỦ ĐỀ BỔ SUNG: ${additionalTopic || 'Không có'}

    YÊU CẦU CHẤT LƯỢNG:
    ✅ Độ dài: Tối thiểu 1000 từ (không tính heading)
    ✅ Tone: Chuyên nghiệp nhưng dễ hiểu, phù hợp với người không chuyên
    ✅ SEO: Từ khóa chính xuất hiện 3-5 lần tự nhiên
    ✅ Cấu trúc: H1, H2, H3 rõ ràng, logic
    ✅ Nội dung: Độc đáo 100%, không đạo văn
    ✅ CTA: Kết thúc với call-to-action phù hợp intent

    CẤU TRÚC BÀI VIẾT:
    1. H1: Title chính (60-70 ký tự, chứa từ khóa)
    2. Mở bài: Hook reader, giới thiệu vấn đề (100-150 từ)
    3. H2 + Nội dung: 3-4 section chính với H2, mỗi section 200-300 từ
    4. H3: Sub-sections để chia nhỏ nội dung dài
    5. Kết luận: Tóm tắt key points + CTA mạnh (100-150 từ)

    FORMATTING:
    - Sử dụng markdown cho heading (# ## ###)
    - Bullet points khi cần thiết
    - **Bold** cho keywords và points quan trọng
    - Đoạn văn ngắn (2-3 câu) để dễ đọc

    Bây giờ hãy tạo ra:
    1. Title SEO (60-70 ký tự)
    2. Meta description (150-160 ký tự)  
    3. Bài viết đầy đủ theo yêu cầu trên

    Viết bằng tiếng Việt hoàn toàn.
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
            content: 'Bạn là chuyên gia viết content SEO tiếng Việt. Luôn tuân thủ yêu cầu về độ dài, cấu trúc và chất lượng. Trả lời theo format: TITLE: [title]\nMETA: [meta description]\nARTICLE: [full article]' 
          },
          { role: 'user', content: contentPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse the response to extract title, meta, and article
    const titleMatch = generatedText.match(/TITLE:\s*(.+?)(?=\nMETA:|\n\n)/);
    const metaMatch = generatedText.match(/META:\s*(.+?)(?=\nARTICLE:|\n\n)/);
    const articleMatch = generatedText.match(/ARTICLE:\s*([\s\S]+)/);

    const title = titleMatch ? titleMatch[1].trim() : `${keyword} - Hướng dẫn chi tiết`;
    const metaDescription = metaMatch ? metaMatch[1].trim() : `Tìm hiểu về ${keyword}. Hướng dẫn chi tiết, dễ hiểu với tips và kinh nghiệm thực tế. Cập nhật mới nhất 2025.`;
    const article = articleMatch ? articleMatch[1].trim() : generatedText;

    const wordCount = article.split(' ').length;

    const result: ContentResponse = {
      title,
      metaDescription,
      article,
      wordCount,
      generatedAt: new Date().toISOString()
    };

    // Log successful generation
    if (userId) {
      try {
        await supabase.from('ai_content_logs').insert({
          ...logData,
          title,
          meta_description: metaDescription,
          article_length: wordCount,
          success: true
        });
      } catch (logError) {
        console.error('Failed to log successful generation:', logError);
      }
    }

    console.log('Content generated successfully. Word count:', wordCount);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content-from-keyword function:', error);
    
    // Log failed generation
    if (userId) {
      try {
        await supabase.from('ai_content_logs').insert({
          ...logData,
          success: false,
          error_message: error.message
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});