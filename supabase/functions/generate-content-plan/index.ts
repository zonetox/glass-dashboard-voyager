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

    const { mainTopic } = await req.json();

    if (!mainTopic) {
      throw new Error('Main topic is required');
    }

    console.log('Generating 30-day content plan for topic:', mainTopic);

    const systemPrompt = `Bạn là một chuyên gia content marketing và SEO. Nhiệm vụ của bạn là tạo ra một kế hoạch nội dung 30 ngày chi tiết và đa dạng.

Quy tắc tạo kế hoạch:
1. Tạo đúng 30 ý tưởng bài viết khác nhau
2. Phân bổ đều các loại search intent: informational (40%), commercial (30%), transactional (20%), navigational (10%)
3. Đa dạng độ dài nội dung: short (500-800 words), medium (800-1200 words), long (1200+ words)
4. Sử dụng các từ khóa liên quan và long-tail keywords
5. Đảm bảo logic thời gian đăng bài (chủ đề cơ bản trước, nâng cao sau)
6. Bao gồm các trending topics và seasonal content nếu phù hợp

Độ dài nội dung:
- short: Bài viết ngắn, quick tips, listicles
- medium: Bài hướng dẫn chi tiết, reviews  
- long: Bài phân tích sâu, comprehensive guides

Search Intent:
- informational: Giải thích, hướng dẫn, mẹo hay
- commercial: So sánh sản phẩm, đánh giá, top X 
- transactional: Mua hàng, đặt dịch vụ, call-to-action mạnh
- navigational: Thông tin thương hiệu, dịch vụ cụ thể

Hãy trả về kết quả theo định dạng JSON với mảng 30 objects, mỗi object có:
- day: số ngày (1-30)
- title: tiêu đề bài viết SEO-friendly
- mainKeyword: từ khóa chính 
- secondaryKeywords: array 2-3 từ khóa phụ
- searchIntent: một trong 4 loại (informational, commercial, transactional, navigational)
- contentLength: một trong 3 loại (short, medium, long)`;

    const userPrompt = `Tạo kế hoạch nội dung 30 ngày cho chủ đề: "${mainTopic}"

Hãy tạo 30 ý tưởng bài viết đa dạng, từ cơ bản đến nâng cao, phù hợp để đăng đều trong 30 ngày.`;

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
        temperature: 0.8,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received for content plan');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    let contentPlan;
    try {
      // Try to parse JSON response from OpenAI
      contentPlan = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating fallback plan');
      // If parsing fails, create a basic fallback plan
      contentPlan = [];
      for (let i = 1; i <= 30; i++) {
        contentPlan.push({
          day: i,
          title: `${mainTopic} - Bài viết ngày ${i}`,
          mainKeyword: mainTopic.toLowerCase(),
          secondaryKeywords: [`${mainTopic} tips`, `${mainTopic} guide`],
          searchIntent: i % 4 === 0 ? 'transactional' : i % 3 === 0 ? 'commercial' : i % 2 === 0 ? 'navigational' : 'informational',
          contentLength: i % 3 === 0 ? 'long' : i % 2 === 0 ? 'medium' : 'short'
        });
      }
    }

    // Validate the generated content plan
    if (!Array.isArray(contentPlan) || contentPlan.length !== 30) {
      throw new Error('Generated content plan is invalid or incomplete');
    }

    // Ensure all required fields are present
    contentPlan.forEach((item, index) => {
      if (!item.day || !item.title || !item.mainKeyword || !item.secondaryKeywords || !item.searchIntent || !item.contentLength) {
        throw new Error(`Content plan item ${index + 1} is missing required fields`);
      }
    });

    console.log('30-day content plan generated successfully');

    return new Response(JSON.stringify({
      mainTopic,
      contentPlan,
      totalIdeas: contentPlan.length
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in generate-content-plan function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content plan',
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