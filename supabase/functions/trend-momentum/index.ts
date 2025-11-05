import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing trend momentum for topic:', topic);

    // Simulate trend data analysis (in real implementation, would integrate with Google Trends API)
    const trendData = generateTrendData(topic);
    const trendAnalysis = analyzeTrend(trendData);
    
    // Generate AI insights
    const aiInsights = await generateTrendInsights(topic, trendAnalysis);

    const result = {
      topic,
      trend: trendAnalysis.trend,
      confidence: trendAnalysis.confidence,
      trendData: trendData,
      suggestedClusters: trendAnalysis.suggestedClusters,
      contentRecommendations: trendAnalysis.contentRecommendations,
      insights: aiInsights,
      generatedAt: new Date().toISOString()
    };

    console.log('Trend momentum analysis completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trend-momentum function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateTrendData(topic: string) {
  // Simulate 12 months of trend data
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    
    // Generate realistic trend values based on topic
    let baseValue = 50;
    let variation = (Math.random() - 0.5) * 20;
    
    // Add some seasonal patterns
    if (topic.toLowerCase().includes('tết') || topic.toLowerCase().includes('xuân')) {
      // New Year topics peak in Jan-Feb
      if (date.getMonth() === 0 || date.getMonth() === 1) {
        baseValue += 30;
      }
    } else if (topic.toLowerCase().includes('hè') || topic.toLowerCase().includes('du lịch')) {
      // Summer topics peak in Jun-Aug
      if (date.getMonth() >= 5 && date.getMonth() <= 7) {
        baseValue += 25;
      }
    }
    
    const searchVolume = Math.max(10, Math.round(baseValue + variation + (Math.random() * 10)));
    
    months.push({
      month: monthName,
      searchVolume,
      contentMentions: Math.round(searchVolume * 0.8 + Math.random() * 20),
      competitionLevel: Math.round(Math.random() * 100)
    });
  }
  
  return months;
}

function analyzeTrend(trendData: any[]) {
  const recentMonths = trendData.slice(-3);
  const previousMonths = trendData.slice(-6, -3);
  
  const recentAvg = recentMonths.reduce((sum, item) => sum + item.searchVolume, 0) / recentMonths.length;
  const previousAvg = previousMonths.reduce((sum, item) => sum + item.searchVolume, 0) / previousMonths.length;
  
  const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  let confidence: number;
  
  if (changePercent > 15) {
    trend = 'increasing';
    confidence = Math.min(95, 70 + Math.abs(changePercent) * 0.5);
  } else if (changePercent < -15) {
    trend = 'decreasing';
    confidence = Math.min(95, 70 + Math.abs(changePercent) * 0.5);
  } else {
    trend = 'stable';
    confidence = Math.max(60, 90 - Math.abs(changePercent) * 2);
  }

  // Generate suggested topic clusters
  const suggestedClusters = [
    `${trendData[0].month} trends`,
    `Related to search volume`,
    `Competition analysis`,
    `Seasonal patterns`,
    `Content opportunities`
  ];

  // Generate content recommendations
  const contentRecommendations = [
    {
      action: trend === 'increasing' ? 'Tăng cường sản xuất nội dung' : trend === 'decreasing' ? 'Tối ưu nội dung hiện có' : 'Duy trì nhịp độ hiện tại',
      priority: trend === 'increasing' ? 'high' : trend === 'decreasing' ? 'medium' : 'low',
      timeline: '2-4 tuần tới'
    },
    {
      action: 'Phân tích đối thủ cạnh tranh',
      priority: 'medium',
      timeline: '1-2 tuần tới'
    },
    {
      action: 'Tối ưu từ khóa dài',
      priority: 'medium',
      timeline: 'Liên tục'
    }
  ];

  return {
    trend,
    confidence: Math.round(confidence),
    changePercent: Math.round(changePercent * 10) / 10,
    suggestedClusters,
    contentRecommendations
  };
}

async function generateTrendInsights(topic: string, analysis: any) {
  if (!openAIApiKey) {
    return "AI insights không khả dụng - cần cấu hình OpenAI API key";
  }

  try {
    const prompt = `Phân tích xu hướng tìm kiếm cho chủ đề: "${topic}"

Dữ liệu phân tích:
- Xu hướng: ${analysis.trend}
- Độ tin cậy: ${analysis.confidence}%
- Thay đổi: ${analysis.changePercent}%

Hãy đưa ra những insight quan trọng về:
1. Nguyên nhân dẫn đến xu hướng này
2. Dự đoán diễn biến trong 3-6 tháng tới
3. Cơ hội nội dung cụ thể
4. Rủi ro cần lưu ý
5. Khuyến nghị chiến lược

Trả lời bằng tiếng Việt, ngắn gọn và actionable.`;

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
            content: 'Bạn là chuyên gia phân tích xu hướng tìm kiếm và marketing nội dung với kinh nghiệm sâu về thị trường Việt Nam.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating trend insights:', error);
    return "Không thể tạo AI insights lúc này. Vui lòng thử lại sau.";
  }
}