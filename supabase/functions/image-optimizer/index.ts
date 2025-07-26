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

interface ImageAnalysisResult {
  url: string;
  images: Array<{
    src: string;
    alt: string;
    width?: string;
    height?: string;
    size_kb?: number;
    issues: string[];
    alt_suggestion?: string;
    optimization_suggestions: string[];
    seo_score: number;
  }>;
  summary: {
    total_images: number;
    missing_alt: number;
    oversized_images: number;
    optimization_opportunities: number;
    overall_score: number;
  };
  timestamp: string;
}

async function getImageSize(imageUrl: string): Promise<number | null> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : null;
  } catch (error) {
    console.warn(`Could not get size for image: ${imageUrl}`, error);
    return null;
  }
}

async function generateAltText(imageUrl: string, pageContext: string): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    return `Hình ảnh liên quan đến nội dung trang`;
  }

  try {
    const prompt = `Tạo alt text cho hình ảnh dựa trên URL và context trang web:

URL hình ảnh: ${imageUrl}
Context trang: ${pageContext}

Yêu cầu:
- Alt text phải mô tả chính xác hình ảnh
- Tối đa 125 ký tự
- Hỗ trợ SEO và accessibility
- Phù hợp với nội dung trang
- Tiếng Việt tự nhiên

Chỉ trả về alt text, không có giải thích thêm.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia về accessibility và SEO. Tạo alt text chính xác và hữu ích.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
    }

    return `Hình ảnh liên quan đến nội dung trang`;
  } catch (error) {
    console.warn('Error generating alt text:', error);
    return `Hình ảnh liên quan đến nội dung trang`;
  }
}

async function analyzeImagesFromWebsite(url: string): Promise<any> {
  try {
    console.log(`Analyzing images from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Image-Optimizer/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract page context for alt text generation
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    
    const pageContext = `
Website: ${url}
Title: ${titleMatch ? titleMatch[1].trim() : ''}
Description: ${metaMatch ? metaMatch[1].trim() : ''}
Main heading: ${h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]*>/g, '').trim() : ''}
`.trim();

    // Extract all images
    const imgRegex = /<img[^>]*>/gi;
    const imgMatches = html.match(imgRegex) || [];
    
    const images = [];
    const baseUrl = new URL(url).origin;
    
    for (let i = 0; i < imgMatches.length; i++) {
      const imgTag = imgMatches[i];
      
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      const widthMatch = imgTag.match(/width=["']([^"']*)["']/i);
      const heightMatch = imgTag.match(/height=["']([^"']*)["']/i);
      
      if (!srcMatch) continue;
      
      let imageSrc = srcMatch[1];
      
      // Convert relative URLs to absolute
      if (imageSrc.startsWith('/')) {
        imageSrc = baseUrl + imageSrc;
      } else if (imageSrc.startsWith('./')) {
        imageSrc = url.substring(0, url.lastIndexOf('/')) + imageSrc.substring(1);
      } else if (!imageSrc.startsWith('http')) {
        imageSrc = url.substring(0, url.lastIndexOf('/')) + '/' + imageSrc;
      }
      
      const alt = altMatch ? altMatch[1] : '';
      const width = widthMatch ? widthMatch[1] : undefined;
      const height = heightMatch ? heightMatch[1] : undefined;
      
      // Get image size
      const sizeBytes = await getImageSize(imageSrc);
      const sizeKb = sizeBytes ? Math.round(sizeBytes / 1024) : undefined;
      
      // Analyze issues
      const issues = [];
      const optimizationSuggestions = [];
      let seoScore = 100;
      
      // Alt text check
      if (!alt.trim()) {
        issues.push('Thiếu alt text');
        optimizationSuggestions.push('Thêm alt text mô tả hình ảnh');
        seoScore -= 30;
      } else if (alt.length > 125) {
        issues.push('Alt text quá dài (>125 ký tự)');
        optimizationSuggestions.push('Rút ngắn alt text xuống dưới 125 ký tự');
        seoScore -= 10;
      } else if (alt.length < 10) {
        issues.push('Alt text quá ngắn');
        optimizationSuggestions.push('Mở rộng alt text để mô tả rõ hơn');
        seoScore -= 10;
      }
      
      // Size check
      if (sizeKb && sizeKb > 500) {
        issues.push(`Hình ảnh quá nặng (${sizeKb}KB)`);
        optimizationSuggestions.push('Nén hình ảnh để giảm kích thước');
        seoScore -= 20;
      } else if (sizeKb && sizeKb > 200) {
        issues.push(`Hình ảnh hơi nặng (${sizeKb}KB)`);
        optimizationSuggestions.push('Cân nhắc nén hình ảnh để tăng tốc độ tải');
        seoScore -= 10;
      }
      
      // Dimension check
      if (!width || !height) {
        issues.push('Thiếu thuộc tính width/height');
        optimizationSuggestions.push('Thêm thuộc tính width và height để tránh layout shift');
        seoScore -= 15;
      }
      
      // Generate alt text suggestion if missing
      let altSuggestion = undefined;
      if (!alt.trim()) {
        altSuggestion = await generateAltText(imageSrc, pageContext);
      }
      
      images.push({
        index: i + 1,
        src: imageSrc,
        alt,
        width,
        height,
        size_kb: sizeKb,
        issues,
        alt_suggestion: altSuggestion,
        optimization_suggestions: optimizationSuggestions,
        seo_score: Math.max(0, seoScore)
      });
    }
    
    return { images, pageContext };
    
  } catch (error) {
    console.error(`Error analyzing images from ${url}:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== IMAGE OPTIMIZER STARTED ===');
  
  try {
    const { url, user_id } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing images for: ${url}`);

    // Log API usage
    if (user_id) {
      await supabase.from('api_logs').insert({
        api_name: 'image-optimizer',
        endpoint: '/image-optimizer',
        user_id,
        domain: new URL(url).hostname,
        method: 'POST',
        success: true,
        created_at: new Date().toISOString()
      });
    }

    // Analyze images from website
    const { images } = await analyzeImagesFromWebsite(url);
    
    // Calculate summary statistics
    const totalImages = images.length;
    const missingAlt = images.filter(img => !img.alt.trim()).length;
    const oversizedImages = images.filter(img => img.size_kb && img.size_kb > 200).length;
    const optimizationOpportunities = images.filter(img => img.issues.length > 0).length;
    
    // Calculate overall score
    const totalPossibleScore = totalImages * 100;
    const actualScore = images.reduce((sum, img) => sum + img.seo_score, 0);
    const overallScore = totalImages > 0 ? Math.round((actualScore / totalPossibleScore) * 100) : 100;
    
    const result: ImageAnalysisResult = {
      url,
      images,
      summary: {
        total_images: totalImages,
        missing_alt: missingAlt,
        oversized_images: oversizedImages,
        optimization_opportunities: optimizationOpportunities,
        overall_score: overallScore
      },
      timestamp: new Date().toISOString()
    };

    console.log('=== IMAGE ANALYSIS COMPLETED ===');
    console.log('Analysis summary:', {
      totalImages,
      missingAlt,
      oversizedImages,
      overallScore
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== IMAGE OPTIMIZER ERROR ===', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze images',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});