
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  url: string;
  title?: string;
  metaDescription?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    missingAlt: number;
    withAlt: number;
  };
  pageSpeedInsights?: {
    desktop: {
      score: number;
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
    };
    mobile: {
      score: number;
      lcp: number;
      fid: number;
      cls: number;
      fcp: number;
    };
    opportunities: string[];
  };
  error?: string;
}

async function crawlWebsite(url: string): Promise<Partial<AnalysisResult>> {
  try {
    console.log(`Starting crawl for: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)',
      },
    });

    if (!response.ok) {
      return { error: `Failed to fetch ${url}: ${response.status} ${response.statusText}` };
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract meta description
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

    // Extract images and check alt attributes
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    let missingAlt = 0;
    let withAlt = 0;

    imgMatches.forEach(img => {
      if (img.includes('alt=')) {
        const altMatch = img.match(/alt=["']([^"']*)["']/i);
        if (!altMatch || !altMatch[1].trim()) {
          missingAlt++;
        } else {
          withAlt++;
        }
      } else {
        missingAlt++;
      }
    });

    const images = {
      total: imgMatches.length,
      missingAlt,
      withAlt,
    };

    console.log(`Crawl completed for: ${url}`);
    return {
      url,
      title,
      metaDescription,
      headings,
      images,
    };

  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return { error: `Failed to crawl website: ${error.message}` };
  }
}

async function analyzePageSpeed(url: string): Promise<any> {
  const apiKey = Deno.env.get('GOOGLE_PAGESPEED_API_KEY');
  
  if (!apiKey) {
    console.log('Google PageSpeed API key not configured');
    return null;
  }

  try {
    console.log(`Starting PageSpeed analysis for: ${url}`);
    
    const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=desktop&category=PERFORMANCE`;
    const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=PERFORMANCE`;

    const [desktopResponse, mobileResponse] = await Promise.all([
      fetch(desktopUrl),
      fetch(mobileUrl)
    ]);

    if (!desktopResponse.ok || !mobileResponse.ok) {
      console.error('PageSpeed API request failed');
      return null;
    }

    const [desktopData, mobileData] = await Promise.all([
      desktopResponse.json(),
      mobileResponse.json()
    ]);

    const extractMetrics = (data: any) => {
      const audits = data.lighthouseResult?.audits || {};
      return {
        score: Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100),
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
      };
    };

    const opportunities = [
      ...(desktopData.lighthouseResult?.audits?.['unused-css-rules']?.details?.items || []).map(() => 'Remove unused CSS'),
      ...(desktopData.lighthouseResult?.audits?.['render-blocking-resources']?.details?.items || []).map(() => 'Eliminate render-blocking resources'),
      ...(desktopData.lighthouseResult?.audits?.['unminified-css']?.details?.items || []).map(() => 'Minify CSS'),
      ...(desktopData.lighthouseResult?.audits?.['unminified-javascript']?.details?.items || []).map(() => 'Minify JavaScript'),
    ].slice(0, 5); // Limit to top 5 opportunities

    console.log(`PageSpeed analysis completed for: ${url}`);
    return {
      desktop: extractMetrics(desktopData),
      mobile: extractMetrics(mobileData),
      opportunities: [...new Set(opportunities)], // Remove duplicates
    };

  } catch (error) {
    console.error(`Error analyzing PageSpeed for ${url}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, projectId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting analysis for: ${url}`);

    // Perform crawling and PageSpeed analysis in parallel
    const [crawlResult, pageSpeedResult] = await Promise.all([
      crawlWebsite(url),
      analyzePageSpeed(url)
    ]);

    const analysisResult: AnalysisResult = {
      ...crawlResult,
      pageSpeedInsights: pageSpeedResult,
    };

    // If we have a project ID, save the results to Supabase
    if (projectId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const issues_found = 
        (crawlResult.images?.missingAlt || 0) +
        (!crawlResult.title ? 1 : 0) +
        (!crawlResult.metaDescription ? 1 : 0) +
        (crawlResult.headings?.h1.length === 0 ? 1 : 0);

      await supabase
        .from('seo_analysis')
        .insert({
          project_id: projectId,
          analysis_data: analysisResult,
          issues_found,
          recommendations: {
            high_priority: issues_found > 5 ? ['Fix critical SEO issues'] : [],
            medium_priority: pageSpeedResult ? ['Improve page speed'] : [],
            low_priority: ['Optimize images', 'Add structured data']
          }
        });

      console.log(`Analysis results saved for project: ${projectId}`);
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-website function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
