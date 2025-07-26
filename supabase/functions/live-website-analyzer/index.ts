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

interface LiveAnalysisResult {
  url: string;
  title?: string;
  metaDescription?: string;
  htmlContent: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: Array<{
    src: string;
    alt: string;
    width?: string;
    height?: string;
    sizeBytes?: number;
    hasAlt: boolean;
    altSuggestion?: string;
  }>;
  existingSchema?: any;
  contentAnalysis?: {
    wordCount: number;
    readingTime: number;
    keywordDensity: Record<string, number>;
  };
  technicalIssues: string[];
  seoScore: number;
  timestamp: string;
}

async function fetchWebsiteContent(url: string): Promise<{ html: string; error?: string }> {
  try {
    console.log(`Fetching live content from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Live-Analyzer/2.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });

    if (!response.ok) {
      return { html: '', error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters from ${url}`);
    return { html };

  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return { html: '', error: error.message };
  }
}

function extractImageDetails(html: string): Array<any> {
  const images: Array<any> = [];
  const imgRegex = /<img[^>]*>/gi;
  const matches = html.match(imgRegex) || [];

  matches.forEach((imgTag, index) => {
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width=["']([^"']*)["']/i);
    const heightMatch = imgTag.match(/height=["']([^"']*)["']/i);

    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    const width = widthMatch ? widthMatch[1] : undefined;
    const height = heightMatch ? heightMatch[1] : undefined;

    images.push({
      index: index + 1,
      src,
      alt,
      width,
      height,
      hasAlt: alt.trim().length > 0,
      needsAltText: alt.trim().length === 0,
      altSuggestion: alt.trim().length === 0 ? `Mô tả hình ảnh ${index + 1}` : undefined
    });
  });

  return images;
}

function extractExistingSchema(html: string): any {
  try {
    const schemaRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const matches = html.match(schemaRegex);
    
    if (!matches) return null;

    const schemas = [];
    for (const match of matches) {
      const jsonMatch = match.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const schema = JSON.parse(jsonMatch[1].trim());
          schemas.push(schema);
        } catch (e) {
          console.warn('Invalid schema found:', e);
        }
      }
    }

    return schemas.length > 0 ? schemas : null;
  } catch (error) {
    console.error('Error extracting schema:', error);
    return null;
  }
}

function analyzeContent(html: string, title?: string): any {
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Basic keyword density analysis
  const keywords = textContent.toLowerCase().split(/\s+/);
  const keywordCount: Record<string, number> = {};
  
  keywords.forEach(word => {
    if (word.length > 3 && !/^\d+$/.test(word)) {
      keywordCount[word] = (keywordCount[word] || 0) + 1;
    }
  });

  // Get top keywords
  const sortedKeywords = Object.entries(keywordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  return {
    wordCount,
    readingTime,
    keywordDensity: sortedKeywords
  };
}

function calculateSEOScore(analysis: Partial<LiveAnalysisResult>): number {
  let score = 100;
  const issues: string[] = [];

  // Title check
  if (!analysis.title) {
    score -= 20;
    issues.push('Thiếu title tag');
  } else if (analysis.title.length < 30 || analysis.title.length > 60) {
    score -= 10;
    issues.push('Title tag không đúng độ dài (30-60 ký tự)');
  }

  // Meta description check
  if (!analysis.metaDescription) {
    score -= 15;
    issues.push('Thiếu meta description');
  } else if (analysis.metaDescription.length < 120 || analysis.metaDescription.length > 160) {
    score -= 8;
    issues.push('Meta description không đúng độ dài (120-160 ký tự)');
  }

  // H1 check
  const h1Count = analysis.headings?.h1.length || 0;
  if (h1Count === 0) {
    score -= 20;
    issues.push('Thiếu thẻ H1');
  } else if (h1Count > 1) {
    score -= 10;
    issues.push('Có nhiều hơn 1 thẻ H1');
  }

  // Images check
  const imagesWithoutAlt = analysis.images?.filter(img => !img.hasAlt).length || 0;
  if (imagesWithoutAlt > 0) {
    score -= Math.min(imagesWithoutAlt * 5, 25);
    issues.push(`${imagesWithoutAlt} hình ảnh thiếu alt text`);
  }

  // Schema check
  if (!analysis.existingSchema) {
    score -= 10;
    issues.push('Thiếu schema markup');
  }

  analysis.technicalIssues = issues;
  return Math.max(0, score);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== LIVE WEBSITE ANALYZER STARTED ===');
  
  try {
    const { url, user_id } = await req.json();
    console.log('Request received:', { url, user_id });

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API usage
    if (user_id) {
      await supabase.from('api_logs').insert({
        api_name: 'live-website-analyzer',
        endpoint: '/live-website-analyzer',
        user_id,
        domain: new URL(url).hostname,
        method: 'POST',
        success: true,
        created_at: new Date().toISOString()
      });
    }

    // Fetch live website content
    const { html, error } = await fetchWebsiteContent(url);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${error}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract basic SEO elements
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : undefined;

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];

    const headings = {
      h1: h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h2: h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
      h3: h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim()),
    };

    // Extract image details
    const images = extractImageDetails(html);

    // Extract existing schema
    const existingSchema = extractExistingSchema(html);

    // Analyze content
    const contentAnalysis = analyzeContent(html, title);

    // Build analysis result
    const analysisResult: LiveAnalysisResult = {
      url,
      title,
      metaDescription,
      htmlContent: html.substring(0, 5000), // Store first 5000 chars for analysis
      headings,
      images,
      existingSchema,
      contentAnalysis,
      technicalIssues: [],
      seoScore: 0,
      timestamp: new Date().toISOString()
    };

    // Calculate SEO score
    analysisResult.seoScore = calculateSEOScore(analysisResult);

    console.log('=== LIVE ANALYSIS COMPLETED ===');
    console.log('Analysis summary:', {
      url: analysisResult.url,
      seoScore: analysisResult.seoScore,
      issuesCount: analysisResult.technicalIssues.length,
      imagesCount: analysisResult.images.length,
      hasSchema: !!analysisResult.existingSchema,
      wordCount: analysisResult.contentAnalysis?.wordCount
    });

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== LIVE ANALYZER ERROR ===', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});