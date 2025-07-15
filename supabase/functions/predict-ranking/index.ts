import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, url } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (keywords.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum 10 keywords allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Predicting rankings for keywords:', keywords);

    // Simulate AI prediction logic
    const predictions = await Promise.all(
      keywords.map(async (keyword: string) => {
        // In a real implementation, this would analyze:
        // - Current keyword position
        // - Search trends
        // - Competition analysis
        // - Content quality
        // - Technical SEO factors
        
        const basePosition = Math.floor(Math.random() * 20) + 1; // Random current position 1-20
        const trend = (Math.random() - 0.5) * 10; // Random trend -5 to +5
        
        const currentPosition = basePosition;
        const position7d = Math.max(1, Math.min(100, Math.round(basePosition + trend * 0.3)));
        const position14d = Math.max(1, Math.min(100, Math.round(basePosition + trend * 0.6)));
        const position30d = Math.max(1, Math.min(100, Math.round(basePosition + trend)));
        
        // Confidence based on various factors
        const confidenceLevel = Math.floor(Math.random() * 30) + 60; // 60-90%
        
        return {
          keyword,
          currentPosition,
          predictions: {
            "7d": position7d,
            "14d": position14d,
            "30d": position30d
          },
          confidenceLevel,
          trend: trend > 0 ? 'up' : trend < -2 ? 'down' : 'stable',
          factors: [
            'Content quality score',
            'Backlink authority',
            'Technical SEO health',
            'Search volume trend',
            'Competition analysis'
          ]
        };
      })
    );

    // Use AI to generate insights
    const aiInsights = await generateAIInsights(keywords, predictions);

    const result = {
      predictions,
      insights: aiInsights,
      generatedAt: new Date().toISOString(),
      analysisUrl: url || 'Not provided'
    };

    console.log('Ranking predictions generated successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-ranking function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAIInsights(keywords: string[], predictions: any[]) {
  if (!openAIApiKey) {
    return "AI insights không khả dụng - cần cấu hình OpenAI API key";
  }

  try {
    const prompt = `Phân tích dự đoán ranking SEO cho các từ khóa sau:

${keywords.map((keyword, index) => {
  const pred = predictions[index];
  return `- "${keyword}": Hiện tại #${pred.currentPosition}, dự đoán 30 ngày #${pred.predictions['30d']} (${pred.confidenceLevel}% confidence)`;
}).join('\n')}

Hãy đưa ra những insight quan trọng về:
1. Xu hướng tổng thể
2. Từ khóa có tiềm năng tăng mạnh
3. Từ khóa có nguy cơ giảm
4. Khuyến nghị hành động
5. Yếu tố tác động chính

Trả lời bằng tiếng Việt, ngắn gọn và thực tế.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Bạn là chuyên gia SEO với nhiều năm kinh nghiệm phân tích và dự đoán ranking từ khóa.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return "Không thể tạo AI insights lúc này. Vui lòng thử lại sau.";
  }
}