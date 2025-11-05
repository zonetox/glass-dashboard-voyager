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
    const { domain, keywords } = await req.json();

    if (!domain || !keywords || !Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: 'Domain and keywords array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing SEO risks for domain:', domain, 'keywords:', keywords);

    // Simulate comprehensive SEO risk analysis
    const riskFactors = await analyzeSEORisks(domain, keywords);
    const overallRisk = calculateOverallRisk(riskFactors);
    const recommendations = generateRecommendations(riskFactors, overallRisk);
    
    // Generate AI insights
    const aiInsights = await generateRiskInsights(domain, keywords, riskFactors, overallRisk);

    const result = {
      domain,
      keywords,
      riskLevel: overallRisk.level,
      riskScore: overallRisk.score,
      confidence: overallRisk.confidence,
      riskFactors,
      recommendations,
      insights: aiInsights,
      generatedAt: new Date().toISOString(),
      autoFixAvailable: recommendations.some(r => r.autoFixAvailable)
    };

    console.log('SEO risk analysis completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seo-risk-alert function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeSEORisks(domain: string, keywords: string[]) {
  // Simulate analysis of various SEO risk factors
  const riskFactors = [];

  // 1. Traffic & Performance Analysis
  const trafficRisk = {
    factor: 'Traffic Performance',
    category: 'performance',
    status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'good',
    details: {
      impressionChange: (Math.random() - 0.5) * 40, // -20% to +20%
      clickChange: (Math.random() - 0.5) * 50, // -25% to +25%
      ctrChange: (Math.random() - 0.5) * 30, // -15% to +15%
      period: '30 ngày qua'
    },
    impact: Math.random() > 0.5 ? 'high' : 'medium',
    description: 'Biến động lưu lượng từ Google Search Console'
  };
  riskFactors.push(trafficRisk);

  // 2. Internal Link Analysis
  const internalLinkRisk = {
    factor: 'Internal Links',
    category: 'technical',
    status: Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'good',
    details: {
      brokenLinks: Math.floor(Math.random() * 15),
      missingLinks: Math.floor(Math.random() * 8),
      orphanPages: Math.floor(Math.random() * 5),
      linkDepth: Math.floor(Math.random() * 6) + 3
    },
    impact: 'medium',
    description: 'Tình trạng liên kết nội bộ và cấu trúc site'
  };
  riskFactors.push(internalLinkRisk);

  // 3. Competitor Activity
  const competitorRisk = {
    factor: 'Competitor Activity',
    category: 'competition',
    status: Math.random() > 0.6 ? 'warning' : 'good',
    details: {
      newContent: Math.floor(Math.random() * 20) + 5,
      keywordOverlap: Math.floor(Math.random() * 80) + 20,
      backlinksGained: Math.floor(Math.random() * 100) + 10,
      period: '7 ngày qua'
    },
    impact: Math.random() > 0.3 ? 'high' : 'medium',
    description: 'Hoạt động của đối thủ cạnh tranh'
  };
  riskFactors.push(competitorRisk);

  // 4. Schema & Structured Data
  const schemaRisk = {
    factor: 'Schema Markup',
    category: 'technical',
    status: Math.random() > 0.7 ? 'warning' : 'good',
    details: {
      missingSchemas: Math.floor(Math.random() * 5),
      invalidSchemas: Math.floor(Math.random() * 3),
      richSnippetLoss: Math.random() > 0.8,
      coverage: Math.floor(Math.random() * 40) + 60 // 60-100%
    },
    impact: 'medium',
    description: 'Tình trạng schema markup và rich snippets'
  };
  riskFactors.push(schemaRisk);

  // 5. Page Speed & Core Web Vitals
  const performanceRisk = {
    factor: 'Core Web Vitals',
    category: 'performance',
    status: Math.random() > 0.6 ? 'warning' : Math.random() > 0.3 ? 'good' : 'critical',
    details: {
      lcp: (Math.random() * 3 + 1).toFixed(1), // 1-4s
      fid: (Math.random() * 200 + 50).toFixed(0), // 50-250ms
      cls: (Math.random() * 0.3).toFixed(2), // 0-0.3
      mobileScore: Math.floor(Math.random() * 40) + 60
    },
    impact: 'high',
    description: 'Hiệu suất trang và trải nghiệm người dùng'
  };
  riskFactors.push(performanceRisk);

  return riskFactors;
}

function calculateOverallRisk(riskFactors: any[]) {
  let totalScore = 0;
  let criticalCount = 0;
  let warningCount = 0;

  riskFactors.forEach(factor => {
    switch (factor.status) {
      case 'critical':
        totalScore += 100;
        criticalCount++;
        break;
      case 'warning':
        totalScore += 60;
        warningCount++;
        break;
      case 'good':
        totalScore += 20;
        break;
    }
  });

  const averageScore = totalScore / riskFactors.length;
  let level: 'low' | 'medium' | 'high';
  let confidence = 85;

  if (criticalCount >= 2 || averageScore >= 80) {
    level = 'high';
    confidence = 90;
  } else if (criticalCount >= 1 || warningCount >= 2 || averageScore >= 50) {
    level = 'medium';
    confidence = 85;
  } else {
    level = 'low';
    confidence = 80;
  }

  return {
    level,
    score: Math.round(averageScore),
    confidence,
    criticalIssues: criticalCount,
    warningIssues: warningCount
  };
}

function generateRecommendations(riskFactors: any[], overallRisk: any) {
  const recommendations = [];

  riskFactors.forEach(factor => {
    if (factor.status === 'critical' || factor.status === 'warning') {
      let action = '';
      let autoFixAvailable = false;
      let priority = factor.status === 'critical' ? 'high' : 'medium';

      switch (factor.factor) {
        case 'Traffic Performance':
          action = 'Kiểm tra và tối ưu content cho từ khóa đang mất ranking';
          autoFixAvailable = false;
          break;
        case 'Internal Links':
          action = 'Sửa broken links và tối ưu cấu trúc liên kết nội bộ';
          autoFixAvailable = true;
          break;
        case 'Competitor Activity':
          action = 'Phân tích và cập nhật content để cạnh tranh';
          autoFixAvailable = false;
          break;
        case 'Schema Markup':
          action = 'Bổ sung và sửa lỗi schema markup';
          autoFixAvailable = true;
          break;
        case 'Core Web Vitals':
          action = 'Tối ưu hiệu suất trang và Core Web Vitals';
          autoFixAvailable = true;
          break;
      }

      recommendations.push({
        factor: factor.factor,
        action,
        priority,
        timeline: priority === 'high' ? 'Ngay lập tức' : 'Trong 1-2 tuần',
        autoFixAvailable,
        category: factor.category
      });
    }
  });

  return recommendations;
}

async function generateRiskInsights(domain: string, keywords: string[], riskFactors: any[], overallRisk: any) {
  if (!openAIApiKey) {
    return "AI insights không khả dụng - cần cấu hình OpenAI API key";
  }

  try {
    const criticalFactors = riskFactors.filter(f => f.status === 'critical').map(f => f.factor);
    const warningFactors = riskFactors.filter(f => f.status === 'warning').map(f => f.factor);

    const prompt = `Phân tích rủi ro SEO cho domain: ${domain}

Keywords theo dõi: ${keywords.join(', ')}
Mức độ rủi ro tổng thể: ${overallRisk.level}
Điểm rủi ro: ${overallRisk.score}/100

Vấn đề nghiêm trọng: ${criticalFactors.join(', ') || 'Không có'}
Vấn đề cảnh báo: ${warningFactors.join(', ') || 'Không có'}

Hãy đưa ra những insight quan trọng về:
1. Nguyên nhân chính gây ra rủi ro
2. Tác động có thể xảy ra nếu không xử lý
3. Thứ tự ưu tiên xử lý các vấn đề
4. Dự đoán thời gian phục hồi
5. Biện pháp phòng ngừa

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
            content: 'Bạn là chuyên gia SEO với nhiều năm kinh nghiệm phân tích và quản lý rủi ro SEO.' 
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
    console.error('Error generating risk insights:', error);
    return "Không thể tạo AI insights lúc này. Vui lòng thử lại sau.";
  }
}