import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    console.log('SEO HTML Suggestions function called');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { url, ai_analysis } = await req.json();
    console.log(`Processing SEO suggestions for URL: ${url}`);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `
Bạn là chuyên gia SEO, hãy phân tích trang web và đưa ra gợi ý cải thiện HTML/metadata để tối ưu SEO.

Trang web: ${url}

Phân tích SEO hiện tại từ AI:
${JSON.stringify(ai_analysis || {}, null, 2)}

👉 Hãy đề xuất cách sửa nội dung HTML hoặc metadata để tối ưu SEO nhất.

Trả về kết quả dưới dạng JSON với các trường sau:

{
  "title": "Title tag mới được tối ưu (50-60 ký tự)",
  "metaDescription": "Meta description mới (150-160 ký tự)",
  "h1": "Thẻ H1 chính được cải thiện",
  "headingStructure": ["H2 đề xuất 1", "H2 đề xuất 2", "H3 con của H2 đầu tiên"],
  "openingParagraph": "Đoạn mở bài được cải thiện, tập trung vào từ khóa chính",
  "targetKeywords": ["từ khóa chính", "từ khóa phụ 1", "từ khóa phụ 2"],
  "keywordDensity": {
    "primary": "từ khóa chính - xuất hiện 3-5 lần",
    "secondary": "từ khóa phụ - xuất hiện 2-3 lần"
  },
  "improvements": [
    "Cải thiện cụ thể 1",
    "Cải thiện cụ thể 2",
    "Cải thiện cụ thể 3"
  ],
  "technicalSEO": {
    "altText": "Alt text cho hình ảnh chính",
    "internalLinks": "Gợi ý liên kết nội bộ",
    "schemaMarkup": "Schema markup được đề xuất"
  }
}

Chỉ trả về JSON, không có text thêm.
`;

    console.log('Calling OpenAI API for SEO suggestions...');

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
            content: 'Bạn là chuyên gia SEO chuyên nghiệp. Luôn trả về JSON hợp lệ với các gợi ý SEO cụ thể và thực tế.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI suggestions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    if (!suggestion) {
      console.error('No suggestion received from OpenAI');
      return new Response(
        JSON.stringify({ error: 'No suggestions generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('SEO suggestions generated successfully');

    // Try to parse as JSON, fallback to text if parsing fails
    let parsedSuggestion;
    try {
      parsedSuggestion = JSON.parse(suggestion);
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, returning as text:', parseError);
      parsedSuggestion = { rawSuggestion: suggestion };
    }

    return new Response(
      JSON.stringify({
        success: true,
        url,
        suggestions: parsedSuggestion,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in seo-html-suggestions function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});