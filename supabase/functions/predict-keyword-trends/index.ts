import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeywordTrend {
  keyword: string;
  trend_score: number;
  reason: string;
  difficulty: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting keyword trend prediction...');
    
    const { topic, content } = await req.json();
    
    if (!topic && !content) {
      throw new Error('Cần cung cấp topic hoặc content để phân tích');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key chưa được cấu hình');
    }

    // Analyze content to extract main topic if only content is provided
    const analyzeText = content || topic;
    
    console.log('Analyzing text for keyword trends:', analyzeText.substring(0, 100));

    // Use OpenAI to predict trending keywords
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
            content: `Bạn là chuyên gia SEO và phân tích xu hướng từ khóa. Hãy phân tích nội dung và dự đoán các từ khóa liên quan đang có xu hướng tăng trưởng.

Trả về JSON array với format chính xác sau:
[
  {
    "keyword": "từ khóa cụ thể",
    "trend_score": số từ 1-100,
    "reason": "lý do tại sao từ khóa này đang trending",
    "difficulty": số từ 1-100 (độ khó để ranking)
  }
]

Lưu ý:
- Chỉ trả về JSON array, không có text khác
- Tối đa 8 từ khóa
- Ưu tiên từ khóa có cơ hội ranking cao
- Xem xét xu hướng thị trường Việt Nam
- trend_score cao = đang tăng trưởng mạnh
- difficulty thấp = dễ ranking hơn`
          },
          {
            role: 'user',
            content: `Phân tích và dự đoán xu hướng từ khóa cho nội dung sau:

${analyzeText}

Hãy tìm các từ khóa liên quan đang có xu hướng tăng trưởng, xem xét:
1. Xu hướng công nghệ và thị trường hiện tại
2. Các chủ đề hot trong cộng đồng
3. Tìm kiếm theo mùa và sự kiện
4. Từ khóa long-tail có cơ hội cao
5. Từ khóa bổ sung có thể mở rộng nội dung

Ưu tiên từ khóa có balance tốt giữa trend_score và difficulty thấp.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const aiResponse = data.choices[0].message.content.trim();
    console.log('AI response:', aiResponse);

    // Parse the JSON response
    let keywordTrends: KeywordTrend[];
    try {
      keywordTrends = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response was:', aiResponse);
      
      // Fallback: try to extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        keywordTrends = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Không thể phân tích phản hồi từ AI');
      }
    }

    // Validate response format
    if (!Array.isArray(keywordTrends)) {
      throw new Error('Định dạng phản hồi không hợp lệ');
    }

    // Ensure all required fields are present and valid
    const validatedTrends = keywordTrends.map(trend => ({
      keyword: String(trend.keyword || '').trim(),
      trend_score: Math.min(100, Math.max(1, Number(trend.trend_score) || 50)),
      reason: String(trend.reason || 'Xu hướng tăng trưởng'),
      difficulty: Math.min(100, Math.max(1, Number(trend.difficulty) || 50))
    })).filter(trend => trend.keyword.length > 0);

    console.log(`Successfully predicted ${validatedTrends.length} keyword trends`);

    // Sort by trend_score desc and difficulty asc for best opportunities
    validatedTrends.sort((a, b) => {
      const scoreA = a.trend_score - (a.difficulty * 0.3); // Weight formula
      const scoreB = b.trend_score - (b.difficulty * 0.3);
      return scoreB - scoreA;
    });

    return new Response(JSON.stringify({
      success: true,
      trends: validatedTrends,
      total_keywords: validatedTrends.length,
      analyzed_content: analyzeText.substring(0, 100) + '...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-keyword-trends function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi dự đoán xu hướng từ khóa',
      trends: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});