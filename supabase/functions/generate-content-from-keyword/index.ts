import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { keyword, contentIntent, additionalTopic } = await req.json();

    if (!keyword) {
      throw new Error('Keyword is required');
    }

    if (!contentIntent) {
      throw new Error('Content intent is required');
    }

    console.log('Generating content for keyword:', keyword, 'with intent:', contentIntent);

    // Create content based on search intent
    const intentPrompts = {
      informational: `Viết một bài viết thông tin chi tiết về "${keyword}". Bài viết cần giải thích đầy đủ và cung cấp thông tin hữu ích cho người đọc muốn tìm hiểu về chủ đề này.`,
      transactional: `Viết một bài viết hướng dẫn mua sắm về "${keyword}". Tập trung vào việc giúp người đọc đưa ra quyết định mua hàng với thông tin về sản phẩm, giá cả, và nơi mua.`,
      commercial: `Viết một bài so sánh và đánh giá về "${keyword}". Bài viết cần phân tích ưu nhược điểm, so sánh các lựa chọn và đưa ra khuyến nghị.`,
      navigational: `Viết một bài viết hướng dẫn tìm kiếm và truy cập thông tin về "${keyword}". Tập trung vào việc giúp người đọc tìm được nguồn thông tin chính xác và đáng tin cậy.`
    };

    const basePrompt = intentPrompts[contentIntent as keyof typeof intentPrompts] || intentPrompts.informational;
    
    const additionalContext = additionalTopic ? `\n\nThông tin bổ sung cần đề cập: ${additionalTopic}` : '';

    const systemPrompt = `Bạn là một chuyên gia SEO và content writer chuyên nghiệp. Nhiệm vụ của bạn là tạo ra nội dung SEO chất lượng cao theo yêu cầu.

Quy tắc viết:
1. Sử dụng từ khóa chính một cách tự nhiên trong toàn bộ bài viết
2. Tạo cấu trúc heading rõ ràng (H2, H3)
3. Viết từ 800-1200 từ
4. Sử dụng bullet points và numbered lists khi phù hợp
5. Tạo nội dung có giá trị, chính xác và hữu ích
6. Tối ưu cho search intent được chỉ định
7. Sử dụng ngôn ngữ tiếng Việt tự nhiên và dễ hiểu

Hãy trả về kết quả theo định dạng JSON với 3 trường:
- title: Tiêu đề SEO tối ưu (50-60 ký tự)
- metaDescription: Meta description hấp dẫn (150-160 ký tự)
- article: Bài viết đầy đủ với formatting HTML đơn giản (h2, h3, p, ul, ol, strong)`;

    const userPrompt = `${basePrompt}${additionalContext}

Từ khóa chính: "${keyword}"
Search Intent: ${contentIntent}

Hãy tạo nội dung theo yêu cầu và trả về theo định dạng JSON đã chỉ định.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    let generatedContent;
    try {
      // Try to parse JSON response from OpenAI
      generatedContent = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback format');
      // If parsing fails, create a structured response
      const content = data.choices[0].message.content;
      generatedContent = {
        title: `${keyword} - Hướng dẫn chi tiết và đánh giá chuyên sâu`,
        metaDescription: `Tìm hiểu mọi thông tin về ${keyword}. Hướng dẫn chi tiết, đánh giá chuyên sâu và lời khuyên hữu ích từ chuyên gia.`,
        article: content
      };
    }

    // Validate the generated content
    if (!generatedContent.title || !generatedContent.metaDescription || !generatedContent.article) {
      throw new Error('Generated content is missing required fields');
    }

    console.log('Content generated successfully');

    return new Response(JSON.stringify(generatedContent), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in generate-content-from-keyword function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content',
      details: error.toString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});