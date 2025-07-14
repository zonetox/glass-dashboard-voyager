import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, industry, timeframe } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Keywords array is required');
    }

    // Simulate Google Trends data (in real implementation, use Google Trends API)
    const trendsData = generateMockTrendsData(keywords, timeframe);
    
    // Generate AI predictions and content suggestions
    const predictions = await generateContentPredictions(trendsData, industry, keywords);

    return new Response(JSON.stringify({
      trendsData,
      predictions,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-trends-predictor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to predict content trends'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateMockTrendsData(keywords: string[], timeframe: string = '3m') {
  return keywords.map(keyword => ({
    keyword,
    currentInterest: Math.floor(Math.random() * 100) + 1,
    trend: Math.random() > 0.5 ? 'rising' : 'falling',
    growthRate: Math.floor(Math.random() * 200) - 100, // -100 to +100
    relatedQueries: [
      `${keyword} 2025`,
      `${keyword} việt nam`,
      `${keyword} mới nhất`,
      `cách ${keyword}`,
      `${keyword} tốt nhất`
    ],
    seasonality: Math.random() > 0.7 ? 'seasonal' : 'stable',
    peakMonths: ['Tháng 3', 'Tháng 6', 'Tháng 11'],
    competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    searchVolume: Math.floor(Math.random() * 10000) + 1000
  }));
}

async function generateContentPredictions(trendsData: any[], industry: string, keywords: string[]) {
  const prompt = `
  Analyze these trending keywords and search data for Vietnamese market:
  
  Trends Data: ${JSON.stringify(trendsData, null, 2)}
  Industry: ${industry}
  Target Keywords: ${keywords.join(', ')}
  
  Based on this data, provide content strategy predictions in JSON format:
  {
    "emergingTopics": [
      {
        "topic": "topic name",
        "predictedGrowth": "percentage",
        "rationale": "why this will trend",
        "timeToTrend": "when it will peak"
      }
    ],
    "contentOpportunities": [
      {
        "contentType": "blog post/video/infographic",
        "title": "suggested title",
        "keywords": ["keyword1", "keyword2"],
        "urgency": "high/medium/low",
        "difficulty": "easy/medium/hard",
        "estimatedTraffic": "potential monthly traffic"
      }
    ],
    "existingContentUpdates": [
      {
        "action": "update/expand/merge",
        "reason": "why update needed",
        "newAngle": "how to refresh content",
        "targetKeywords": ["keyword1", "keyword2"]
      }
    ],
    "seasonalStrategy": {
      "upcomingPeaks": ["month predictions"],
      "prepareBy": "preparation timeline",
      "contentTypes": ["recommended formats"]
    },
    "competitorGaps": [
      {
        "opportunity": "gap description",
        "keywords": ["untapped keywords"],
        "difficulty": "competition level"
      }
    ]
  }
  
  Focus on Vietnamese market trends and provide actionable, specific recommendations.
  `;

  try {
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
            content: 'You are a Vietnamese content strategy expert with deep knowledge of search trends and content marketing. Provide comprehensive predictions in valid JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate predictions');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating predictions:', error);
    return {
      emergingTopics: [
        {
          topic: "AI trong marketing",
          predictedGrowth: "150%",
          rationale: "Sự phát triển của AI tools",
          timeToTrend: "Q2 2025"
        }
      ],
      contentOpportunities: [
        {
          contentType: "blog post",
          title: "10 xu hướng content marketing 2025",
          keywords: keywords,
          urgency: "high",
          difficulty: "medium",
          estimatedTraffic: "2000-5000/tháng"
        }
      ],
      existingContentUpdates: [
        {
          action: "update",
          reason: "Thông tin cũ, cần cập nhật 2025",
          newAngle: "Thêm AI và automation",
          targetKeywords: keywords
        }
      ],
      seasonalStrategy: {
        upcomingPeaks: ["Tháng 3", "Tháng 8"],
        prepareBy: "2 tháng trước peak",
        contentTypes: ["video", "infographic"]
      },
      competitorGaps: [
        {
          opportunity: "Content về AI automation",
          keywords: ["ai automation", "tự động hóa"],
          difficulty: "medium"
        }
      ]
    };
  }
}