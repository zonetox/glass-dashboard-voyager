import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TopicAuthority {
  topic: string;
  authority_score: number;
  article_count: number;
  keyword_coverage: number;
  intent_match: number;
  strengths: string[];
  weaknesses: string[];
  category: string;
}

interface AuthorityAnalysis {
  overall_score: number;
  dominant_topics: TopicAuthority[];
  suggested_topics: string[];
  coverage_gaps: string[];
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting topical authority analysis...');
    
    const { domain, user_id, articles } = await req.json();
    
    if (!domain && !articles && !user_id) {
      throw new Error('Cần cung cấp domain, user_id hoặc articles để phân tích');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key chưa được cấu hình');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get user's content for analysis
    let contentData = [];
    
    if (articles && Array.isArray(articles)) {
      contentData = articles;
    } else if (user_id) {
      // Fetch user's scans and content intent data
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select(`
          id,
          url,
          seo,
          ai_analysis,
          created_at,
          content_intent(
            intent_type,
            confidence
          )
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (scansError) {
        console.error('Error fetching scans:', scansError);
        throw new Error('Không thể lấy dữ liệu phân tích của người dùng');
      }

      contentData = scansData || [];
    }

    if (contentData.length === 0) {
      throw new Error('Không có dữ liệu để phân tích topical authority');
    }

    console.log(`Analyzing ${contentData.length} pieces of content`);

    // Prepare content summary for AI analysis
    const contentSummary = contentData.map((item, index) => {
      const seo = item.seo || {};
      const aiAnalysis = item.ai_analysis || {};
      const intent = item.content_intent?.[0] || {};
      
      return {
        id: index + 1,
        url: item.url || 'Unknown URL',
        title: seo.title || aiAnalysis.title || 'No title',
        description: seo.description || aiAnalysis.description || '',
        content: seo.content || aiAnalysis.content || '',
        keywords: seo.keywords || aiAnalysis.keywords || [],
        intent_type: intent.intent_type || 'unknown',
        intent_confidence: intent.confidence || 0
      };
    }).slice(0, 20); // Limit to 20 for AI processing

    // Use OpenAI to analyze topical authority
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
            content: `Bạn là chuyên gia phân tích Topical Authority SEO. Hãy phân tích danh sách nội dung và đánh giá sức mạnh chủ đề của website.

Trả về JSON với format chính xác:
{
  "overall_score": số từ 1-100,
  "dominant_topics": [
    {
      "topic": "tên chủ đề",
      "authority_score": số từ 1-100,
      "article_count": số bài viết,
      "keyword_coverage": số từ 1-100,
      "intent_match": số từ 1-100,
      "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
      "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
      "category": "primary|secondary|emerging"
    }
  ],
  "suggested_topics": ["chủ đề đề xuất 1", "chủ đề đề xuất 2"],
  "coverage_gaps": ["khoảng trống 1", "khoảng trống 2"],
  "recommendations": ["đề xuất 1", "đề xuất 2"]
}

Tiêu chí đánh giá:
1. Authority Score = (số bài viết × 20) + (keyword coverage × 30) + (intent match × 30) + (chất lượng × 20)
2. Primary: >80 points, Secondary: 50-80, Emerging: <50
3. Ưu tiên chủ đề có nhiều bài viết và intent match cao
4. Tìm khoảng trống trong coverage và đề xuất mở rộng`
          },
          {
            role: 'user',
            content: `Phân tích Topical Authority cho website với ${contentData.length} bài viết:

${JSON.stringify(contentSummary, null, 2)}

Hãy:
1. Xác định 5-8 chủ đề chính website đang thống trị
2. Tính Authority Score cho từng chủ đề
3. Đánh giá độ phủ keyword và intent match
4. Đề xuất chủ đề cần tăng cường
5. Tìm khoảng trống trong coverage

Lưu ý: Phân tích cho thị trường Việt Nam, ưu tiên các chủ đề có tiềm năng SEO cao.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
    let authorityAnalysis: AuthorityAnalysis;
    try {
      authorityAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response was:', aiResponse);
      
      // Fallback: try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        authorityAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Không thể phân tích phản hồi từ AI');
      }
    }

    // Validate and enhance the response
    if (!authorityAnalysis.dominant_topics || !Array.isArray(authorityAnalysis.dominant_topics)) {
      throw new Error('Định dạng phản hồi không hợp lệ');
    }

    // Ensure all required fields are present
    const validatedAnalysis: AuthorityAnalysis = {
      overall_score: Math.min(100, Math.max(1, Number(authorityAnalysis.overall_score) || 50)),
      dominant_topics: authorityAnalysis.dominant_topics.map(topic => ({
        topic: String(topic.topic || 'Unknown Topic').trim(),
        authority_score: Math.min(100, Math.max(1, Number(topic.authority_score) || 50)),
        article_count: Math.max(0, Number(topic.article_count) || 0),
        keyword_coverage: Math.min(100, Math.max(1, Number(topic.keyword_coverage) || 50)),
        intent_match: Math.min(100, Math.max(1, Number(topic.intent_match) || 50)),
        strengths: Array.isArray(topic.strengths) ? topic.strengths : ['Cần phân tích thêm'],
        weaknesses: Array.isArray(topic.weaknesses) ? topic.weaknesses : ['Cần phân tích thêm'],
        category: ['primary', 'secondary', 'emerging'].includes(topic.category) ? topic.category : 'emerging'
      })).filter(topic => topic.topic.length > 0),
      suggested_topics: Array.isArray(authorityAnalysis.suggested_topics) ? authorityAnalysis.suggested_topics : [],
      coverage_gaps: Array.isArray(authorityAnalysis.coverage_gaps) ? authorityAnalysis.coverage_gaps : [],
      recommendations: Array.isArray(authorityAnalysis.recommendations) ? authorityAnalysis.recommendations : []
    };

    // Sort topics by authority score
    validatedAnalysis.dominant_topics.sort((a, b) => b.authority_score - a.authority_score);

    console.log(`Successfully analyzed topical authority for ${validatedAnalysis.dominant_topics.length} topics`);

    return new Response(JSON.stringify({
      success: true,
      analysis: validatedAnalysis,
      total_content: contentData.length,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-topical-authority function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Đã xảy ra lỗi khi phân tích topical authority',
      analysis: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});