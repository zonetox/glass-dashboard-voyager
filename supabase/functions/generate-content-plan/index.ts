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

    const { domain, mainTopic } = await req.json();

    if (!domain || !mainTopic) {
      return new Response(
        JSON.stringify({ error: 'Domain and mainTopic are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Generating 6-month content plan for domain: ${domain}, topic: ${mainTopic}`);

    // Step 1: Analyze website content and competitors
    const websiteAnalysis = await analyzeWebsiteAndCompetitors(domain, mainTopic);
    
    // Step 2: Generate comprehensive 6-month content plan
    const contentPlan = await generateSixMonthPlan(domain, mainTopic, websiteAnalysis);

    console.log(`Generated 6-month content plan with ${contentPlan.content_plan.length} articles`);

    return new Response(JSON.stringify(contentPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeWebsiteAndCompetitors(domain: string, mainTopic: string) {
  const analysisPrompt = `Phân tích website ${domain} cho chủ đề "${mainTopic}" và đưa ra:

1. PHÂN TÍCH WEBSITE HIỆN TẠI:
   - Các chủ đề semantic đã có trên website
   - Khoảng trống nội dung (content gaps)
   - Độ sâu chuyên môn hiện tại
   - Các định dạng nội dung đang sử dụng

2. PHÂN TÍCH ĐỐI THỦ:
   - Điểm mạnh của đối thủ trong ${mainTopic}
   - Cơ hội nội dung chưa được khai thác
   - Các format thành công trong ngành
   - Xu hướng theo mùa

3. DỰ ĐOÁN XU HƯỚNG:
   - Xu hướng tìm kiếm trong 6 tháng tới
   - Các chủ đề mới nổi
   - Thay đổi hành vi người dùng
   - Thời điểm cao điểm tìm kiếm

Trả về JSON format:
{
  "website_analysis": {
    "existing_topics": ["chủ đề 1", "chủ đề 2"],
    "content_gaps": ["khoảng trống 1", "khoảng trống 2"],
    "expertise_level": "beginner/intermediate/advanced",
    "current_formats": ["blog", "guide", "video"]
  },
  "competitor_analysis": {
    "competitor_strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "opportunities": ["cơ hội 1", "cơ hội 2"],
    "successful_formats": ["format 1", "format 2"],
    "seasonal_trends": ["xu hướng 1", "xu hướng 2"]
  },
  "trend_predictions": {
    "emerging_topics": ["chủ đề mới 1", "chủ đề mới 2"],
    "search_peaks": ["thời điểm 1", "thời điểm 2"],
    "consumer_behaviors": ["hành vi 1", "hành vi 2"]
  }
}`;

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
          { role: 'system', content: 'Bạn là chuyên gia phân tích SEO và content marketing tại Việt Nam. Đưa ra những insight chính xác và khả thi.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing website and competitors:', error);
    // Fallback analysis
    return {
      website_analysis: {
        existing_topics: [`${mainTopic} cơ bản`, `Giới thiệu ${mainTopic}`],
        content_gaps: [`${mainTopic} nâng cao`, `So sánh ${mainTopic}`, `Case study ${mainTopic}`],
        expertise_level: "intermediate",
        current_formats: ["blog", "hướng dẫn"]
      },
      competitor_analysis: {
        competitor_strengths: [`Nội dung ${mainTopic} chuyên sâu`, `Video hướng dẫn chi tiết`],
        opportunities: [`FAQ ${mainTopic}`, `Behind-the-scenes`, `User-generated content`],
        successful_formats: ["how-to guides", "comparison posts", "case studies"],
        seasonal_trends: ["Tết Nguyên Đán", "Black Friday", "Mùa hè"]
      },
      trend_predictions: {
        emerging_topics: [`AI trong ${mainTopic}`, `${mainTopic} bền vững`, `${mainTopic} local`],
        search_peaks: ["Tháng 1-2 (Tết)", "Tháng 6-8 (Hè)", "Tháng 11-12 (Sale cuối năm)"],
        consumer_behaviors: ["Tìm hiểu kỹ trước khi mua", "So sánh giá online", "Đọc review từ người dùng"]
      }
    };
  }
}

async function generateSixMonthPlan(domain: string, mainTopic: string, analysis: any) {
  const currentDate = new Date();
  
  const planningPrompt = `Tạo kế hoạch nội dung 6 tháng chi tiết cho website ${domain} với chủ đề "${mainTopic}".

THÔNG TIN PHÂN TÍCH:
${JSON.stringify(analysis, null, 2)}

YÊU CẦU KẾ HOẠCH:
1. Tổng cộng 26 bài viết (1 tuần/bài) trong 6 tháng
2. Ngày đăng cụ thể (tính từ ${currentDate.toLocaleDateString('vi-VN')})
3. Tiêu đề hấp dẫn, tối ưu SEO bằng tiếng Việt
4. Phân loại content type: blog, hướng dẫn, so sánh, case study, review, listicle, FAQ
5. Search intent: informational (40%), commercial (30%), transactional (20%), navigational (10%)
6. Từ khóa chính và phụ (tiếng Việt)
7. Ghi chú AI với CTA, internal link, tips cụ thể

CHIẾN LƯỢC NỘI DUNG:
- Tuần 1-4: Nội dung cơ bản, xây dựng nền tảng
- Tuần 5-12: Chuyên sâu, giải quyết vấn đề cụ thể  
- Tuần 13-20: Nâng cao, so sánh, case study
- Tuần 21-26: Xu hướng mới, tương lai ngành

PHÂN BỔ CONTENT TYPE:
- Blog posts: 30%
- Hướng dẫn: 25% 
- So sánh/Review: 20%
- Case study: 15%
- Listicle/FAQ: 10%

Trả về JSON format:
{
  "main_topic": "${mainTopic}",
  "domain": "${domain}",
  "plan_duration": "6 tháng",
  "total_articles": 26,
  "content_plan": [
    {
      "week": 1,
      "date": "2025-01-20",
      "title": "Tiêu đề SEO-optimized bằng tiếng Việt",
      "content_type": "blog",
      "search_intent": "informational",
      "main_keyword": "từ khóa chính",
      "secondary_keywords": ["từ khóa phụ 1", "từ khóa phụ 2", "từ khóa phụ 3"],
      "ai_notes": "CTA: Đăng ký tư vấn miễn phí. Internal links: Link tới bài X, Y. Tips: Thêm infographic so sánh, video demo 2-3 phút, FAQ cuối bài"
    }
  ]
}`;

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
            content: 'Bạn là chuyên gia SEO content strategy hàng đầu Việt Nam. Tạo kế hoạch nội dung chi tiết, khả thi và hiệu quả để xây dựng thẩm quyền chủ đề (topical authority).' 
          },
          { role: 'user', content: planningPrompt }
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const contentPlan = JSON.parse(data.choices[0].message.content);
    
    // Validate structure
    if (!contentPlan.content_plan || !Array.isArray(contentPlan.content_plan)) {
      throw new Error('Invalid content plan structure');
    }
    
    return contentPlan;
    
  } catch (error) {
    console.error('Error generating 6-month plan:', error);
    
    // Generate fallback plan
    return generateFallbackSixMonthPlan(mainTopic, domain, currentDate);
  }
}

function generateFallbackSixMonthPlan(mainTopic: string, domain: string, startDate: Date) {
  const contentTypes = ['blog', 'hướng dẫn', 'so sánh', 'case study', 'review', 'listicle', 'FAQ'];
  const searchIntents = ['informational', 'commercial', 'transactional', 'navigational'];
  
  const contentPlan = [];
  
  for (let week = 1; week <= 26; week++) {
    const articleDate = new Date(startDate);
    articleDate.setDate(articleDate.getDate() + (week - 1) * 7);
    
    const contentType = contentTypes[week % contentTypes.length];
    const searchIntent = searchIntents[week % searchIntents.length];
    
    contentPlan.push({
      week,
      date: articleDate.toISOString().split('T')[0],
      title: `${mainTopic} ${getVietnameseTitleSuffix(contentType, week)}`,
      content_type: contentType,
      search_intent: searchIntent,
      main_keyword: `${mainTopic.toLowerCase()} ${getKeywordModifier(week)}`,
      secondary_keywords: [
        `${mainTopic.toLowerCase()} tốt nhất`,
        `cách chọn ${mainTopic.toLowerCase()}`,
        `${mainTopic.toLowerCase()} chất lượng`
      ],
      ai_notes: `CTA: Liên hệ tư vấn miễn phí qua hotline. Internal links: Bài viết liên quan về ${mainTopic}, trang dịch vụ. Tips: Thêm hình ảnh minh họa chất lượng cao, video demo ngắn, bảng so sánh chi tiết`
    });
  }
  
  return {
    main_topic: mainTopic,
    domain: domain,
    plan_duration: "6 tháng",
    total_articles: contentPlan.length,
    content_plan: contentPlan
  };
}

function getVietnameseTitleSuffix(contentType: string, week: number): string {
  const suffixes = {
    'blog': [
      '- Hướng dẫn chi tiết từ A đến Z', 
      '- Kinh nghiệm thực tế bạn cần biết', 
      '- Bí quyết từ chuyên gia hàng đầu',
      '- Những điều quan trọng cần lưu ý',
      '- Cập nhật xu hướng mới nhất'
    ],
    'hướng dẫn': [
      'cho người mới bắt đầu', 
      'từ cơ bản đến nâng cao', 
      'chuyên nghiệp và hiệu quả',
      'đơn giản mà ai cũng làm được',
      'theo tiêu chuẩn quốc tế'
    ],
    'so sánh': [
      'vs đối thủ - Nên chọn gì?', 
      '- So sánh chi tiết và đánh giá', 
      '- Phân tích ưu nhược điểm',
      '- Bảng so sánh đầy đủ nhất',
      '- Lựa chọn nào phù hợp với bạn?'
    ],
    'case study': [
      '- Câu chuyện thành công có thật', 
      '- Phân tích case thực tế', 
      '- Kinh nghiệm triển khai thực tiễn',
      '- Bài học từ doanh nghiệp hàng đầu',
      '- Tình huống thực tế và giải pháp'
    ],
    'review': [
      '- Đánh giá chi tiết và trung thực', 
      '- Review từ chuyên gia', 
      '- Có thực sự đáng đầu tư?',
      '- Trải nghiệm thực tế của người dùng',
      '- Ưu nhược điểm cần biết'
    ],
    'listicle': [
      '- Top 10 lựa chọn hàng đầu 2025', 
      '- 7 mẹo hữu ích bạn chưa biết', 
      '- 5 lỗi thường gặp cần tránh',
      '- 15 cách hiệu quả nhất',
      '- 8 xu hướng đáng chú ý'
    ],
    'FAQ': [
      '- Câu hỏi thường gặp và giải đáp', 
      '- Hỏi đáp từ chuyên gia', 
      '- Những thắc mắc phổ biến nhất',
      '- Giải đáp mọi thắc mắc của bạn',
      '- FAQ từ A đến Z'
    ]
  };
  
  const typeSuffixes = suffixes[contentType] || suffixes['blog'];
  return typeSuffixes[week % typeSuffixes.length];
}

function getKeywordModifier(week: number): string {
  const modifiers = [
    'tốt nhất', 'chất lượng cao', 'uy tín', 'giá tốt', 'hiệu quả', 'chuyên nghiệp',
    'hàng đầu', 'đáng tin cậy', 'phù hợp', 'nhanh chóng', 'an toàn', 'bền vững',
    'tiết kiệm', 'thông minh', 'đổi mới', 'cao cấp', 'tiện lợi', 'đa dạng'
  ];
  return modifiers[week % modifiers.length];
}