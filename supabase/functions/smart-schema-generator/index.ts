import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SchemaRequest {
  url: string;
  existing_schema?: any;
  page_content?: {
    title?: string;
    description?: string;
    headings?: string[];
    content?: string;
  };
  schema_type?: string; // If user wants specific schema type
  user_id?: string;
}

function extractExistingSchemas(html: string): any[] {
  try {
    const schemaRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const matches = html.match(schemaRegex);
    
    if (!matches) return [];

    const schemas: any[] = [];
    for (const match of matches) {
      const jsonMatch = match.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const schema = JSON.parse(jsonMatch[1].trim());
          schemas.push(schema);
        } catch (e) {
          console.warn('Invalid existing schema found:', e);
        }
      }
    }

    return schemas;
  } catch (error) {
    console.error('Error extracting existing schemas:', error);
    return [];
  }
}

async function analyzePageForSchema(url: string): Promise<any> {
  try {
    console.log(`Analyzing page content for schema: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Smart-Schema-Generator/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract page elements
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    
    // Extract existing schemas
    const existingSchemas = extractExistingSchemas(html);
    
    // Extract content for analysis
    const textContent = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
                           .replace(/<style[^>]*>.*?<\/style>/gis, '')
                           .replace(/<[^>]*>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()
                           .substring(0, 3000); // Limit for AI analysis

    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: metaMatch ? metaMatch[1].trim() : '',
      headings: [
        ...h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
        ...h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
        ...h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim())
      ].slice(0, 10),
      content: textContent,
      existingSchemas,
      domain: new URL(url).hostname
    };

  } catch (error) {
    console.error(`Error analyzing page ${url}:`, error);
    return {
      title: '',
      description: '',
      headings: [],
      content: '',
      existingSchemas: [],
      domain: new URL(url).hostname
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== SMART SCHEMA GENERATOR STARTED ===');
  
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, existing_schema, page_content, schema_type, user_id }: SchemaRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating schema for: ${url}`);

    // Analyze page content if not provided
    let pageAnalysis = page_content;
    let existingSchemas = existing_schema ? [existing_schema] : [];
    
    if (!pageAnalysis) {
      const analysis = await analyzePageForSchema(url);
      pageAnalysis = {
        title: analysis.title,
        description: analysis.description,
        headings: analysis.headings,
        content: analysis.content
      };
      existingSchemas = analysis.existingSchemas;
    }

    // Log API usage
    if (user_id) {
      await supabase.from('api_logs').insert({
        api_name: 'smart-schema-generator',
        endpoint: '/smart-schema-generator',
        user_id,
        domain: new URL(url).hostname,
        method: 'POST',
        request_payload: { schema_type, has_existing: existingSchemas.length > 0 },
        success: true,
        created_at: new Date().toISOString()
      });
    }

    // Determine action needed
    let action = 'create';
    let schemaAnalysis = '';
    
    if (existingSchemas.length > 0) {
      action = 'improve';
      schemaAnalysis = `
SCHEMA HIỆN TẠI:
${JSON.stringify(existingSchemas, null, 2)}

PHÂN TÍCH: Trang đã có ${existingSchemas.length} schema(s). Cần kiểm tra tính chính xác và đề xuất cải thiện.
`;
    } else {
      schemaAnalysis = 'PHÂN TÍCH: Trang chưa có schema markup. Cần tạo schema phù hợp.';
    }

    const systemPrompt = `Bạn là chuyên gia Schema.org và Structured Data. Nhiệm vụ của bạn là:

1. Phân tích nội dung trang web
2. Đề xuất schema markup phù hợp nhất
3. Tạo JSON-LD chính xác theo chuẩn Schema.org
4. Đảm bảo schema hỗ trợ SEO và Rich Snippets

NGUYÊN TẮC:
- Schema phải CHÍNH XÁC và tuân thủ Schema.org
- Sử dụng thông tin THỰC TẾ từ trang web
- Ưu tiên schema có giá trị SEO cao
- JSON phải hợp lệ và có thể copy-paste`;

    const userPrompt = `Phân tích trang web và tạo schema markup tối ưu:

URL: ${url}
${schemaAnalysis}

THÔNG TIN TRANG:
Title: ${pageAnalysis?.title || 'Không có'}
Description: ${pageAnalysis?.description || 'Không có'}
Headings: ${pageAnalysis?.headings?.join(', ') || 'Không có'}

NỘI DUNG TRANG (trích đoạn):
${pageAnalysis?.content?.substring(0, 1000) || 'Không có nội dung'}

${schema_type ? `LOẠI SCHEMA YÊU CẦU: ${schema_type}` : ''}

Hãy thực hiện:

1. Xác định loại schema phù hợp nhất (Article, WebPage, Product, FAQ, Organization, LocalBusiness, etc.)
2. ${action === 'improve' ? 'Phân tích schema hiện tại và đề xuất cải thiện' : 'Tạo schema mới hoàn chỉnh'}
3. Tạo JSON-LD chuẩn xác

Trả về JSON với cấu trúc:
{
  "analysis": {
    "recommended_schema_type": "Article",
    "current_issues": ["Vấn đề 1", "Vấn đề 2"] hoặc [],
    "seo_benefits": ["Lợi ích 1", "Lợi ích 2"]
  },
  "schema_json": {
    // JSON-LD schema hoàn chỉnh, ready để copy
  },
  "implementation": {
    "how_to_add": "Hướng dẫn thêm vào trang",
    "validation_url": "https://search.google.com/test/rich-results",
    "expected_rich_snippets": ["Rich snippet có thể có"]
  }
}

Đảm bảo JSON-LD trong schema_json có thể copy trực tiếp vào trang web.`;

    console.log('Calling OpenAI for schema generation...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Received response from OpenAI');

    // Parse AI response
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn('AI response not in JSON format, creating fallback');
      
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/```json\n(.*?)\n```/s) || aiResponse.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const schemaJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          result = {
            analysis: {
              recommended_schema_type: "WebPage",
              current_issues: [],
              seo_benefits: ["Cải thiện hiển thị trong kết quả tìm kiếm"]
            },
            schema_json: schemaJson,
            implementation: {
              how_to_add: "Thêm vào thẻ <head> của trang",
              validation_url: "https://search.google.com/test/rich-results",
              expected_rich_snippets: ["Enhanced search results"]
            }
          };
        } catch (e) {
          throw new Error('Could not parse schema from AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Add metadata
    result.url = url;
    result.action = action;
    result.existing_schemas_count = existingSchemas.length;
    result.timestamp = new Date().toISOString();
    
    // Validate generated schema
    try {
      if (result.schema_json && typeof result.schema_json === 'object') {
        result.validation = {
          is_valid_json: true,
          has_context: !!result.schema_json['@context'],
          has_type: !!result.schema_json['@type'],
          schema_type: result.schema_json['@type']
        };
      }
    } catch (validationError) {
      console.warn('Schema validation failed:', validationError);
      result.validation = { is_valid_json: false };
    }

    console.log('=== SCHEMA GENERATION COMPLETED ===');
    console.log('Result summary:', {
      action,
      schemaType: result.analysis?.recommended_schema_type,
      hasValidJson: result.validation?.is_valid_json,
      existingSchemasCount: existingSchemas.length
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SMART SCHEMA GENERATOR ERROR ===', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate schema',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});