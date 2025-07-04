
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
  aiAnalysis?: {
    citationPotential: string;
    semanticGaps: string[];
    faqSuggestions: string[];
    improvementSuggestions: string[];
  };
  schemaMarkup?: {
    type: string;
    jsonLd: any;
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
      fullContent: html // Store for AI analysis
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
    ].slice(0, 5);

    console.log(`PageSpeed analysis completed for: ${url}`);
    return {
      desktop: extractMetrics(desktopData),
      mobile: extractMetrics(mobileData),
      opportunities: [...new Set(opportunities)],
    };

  } catch (error) {
    console.error(`Error analyzing PageSpeed for ${url}:`, error);
    return null;
  }
}

async function analyzeWithAI(content: any): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('OpenAI API key not configured');
    return null;
  }

  try {
    console.log('Starting AI analysis');
    
    const contentSummary = `
    Title: ${content.title || 'No title'}
    Meta Description: ${content.metaDescription || 'No description'}
    H1 Tags: ${content.headings.h1.join(', ') || 'None'}
    H2 Tags: ${content.headings.h2.slice(0, 5).join(', ') || 'None'}
    H3 Tags: ${content.headings.h3.slice(0, 5).join(', ') || 'None'}
    Images: ${content.images.total} total (${content.images.missingAlt} missing alt text)
    `;

    const prompt = `Analyze this webpage content for AI citation potential:

${contentSummary}

Please provide analysis in this exact format:

CITATION POTENTIAL: [Rate from 1-10 and explain why this page would/wouldn't be cited by ChatGPT or Google SGE]

SEMANTIC GAPS: [List 3-5 missing topics or information gaps that would improve comprehensiveness]

FAQ SUGGESTIONS: [Suggest 3-5 frequently asked questions that should be added to improve AI-readability]

IMPROVEMENT SUGGESTIONS: [Provide 3-5 specific recommendations to make this content more likely to be cited by AI systems]

Keep responses concise and actionable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO expert analyzing content for AI citation potential. Provide structured, actionable recommendations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API request failed');
      return null;
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Parse the structured response
    const sections = analysis.split('\n\n');
    const citationPotential = sections.find(s => s.startsWith('CITATION POTENTIAL:'))?.replace('CITATION POTENTIAL:', '').trim() || '';
    const semanticGaps = sections.find(s => s.startsWith('SEMANTIC GAPS:'))?.replace('SEMANTIC GAPS:', '').trim().split('\n').filter(Boolean) || [];
    const faqSuggestions = sections.find(s => s.startsWith('FAQ SUGGESTIONS:'))?.replace('FAQ SUGGESTIONS:', '').trim().split('\n').filter(Boolean) || [];
    const improvementSuggestions = sections.find(s => s.startsWith('IMPROVEMENT SUGGESTIONS:'))?.replace('IMPROVEMENT SUGGESTIONS:', '').trim().split('\n').filter(Boolean) || [];

    console.log('AI analysis completed');
    return {
      citationPotential,
      semanticGaps,
      faqSuggestions,
      improvementSuggestions
    };

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return null;
  }
}

async function generateSchemaMarkup(content: any): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('OpenAI API key not configured for schema generation');
    return null;
  }

  try {
    console.log('Generating schema.org markup');
    
    const contentSummary = `
    URL: ${content.url}
    Title: ${content.title || 'No title'}
    Meta Description: ${content.metaDescription || 'No description'}
    H1 Tags: ${content.headings.h1.join(', ') || 'None'}
    H2 Tags: ${content.headings.h2.join(', ') || 'None'}
    `;

    const prompt = `Based on this webpage content, generate appropriate schema.org JSON-LD markup:

${contentSummary}

Choose the most suitable schema type (Article, BlogPosting, WebPage, FAQ, Product, etc.) and generate valid JSON-LD markup. Return ONLY the JSON without any explanations or markdown formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a schema.org expert. Generate valid JSON-LD markup based on webpage content. Return only JSON without explanations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API request failed for schema generation');
      return null;
    }

    const data = await response.json();
    let jsonLd = data.choices[0].message.content.trim();
    
    // Clean up the response to ensure it's valid JSON
    jsonLd = jsonLd.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedSchema = JSON.parse(jsonLd);
      const schemaType = parsedSchema['@type'] || 'WebPage';
      
      console.log('Schema markup generated successfully');
      return {
        type: schemaType,
        jsonLd: parsedSchema
      };
    } catch (parseError) {
      console.error('Failed to parse generated schema:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Error generating schema markup:', error);
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

    console.log(`Starting comprehensive analysis for: ${url}`);

    // Perform crawling and PageSpeed analysis in parallel
    const [crawlResult, pageSpeedResult] = await Promise.all([
      crawlWebsite(url),
      analyzePageSpeed(url)
    ]);

    if (crawlResult.error) {
      return new Response(
        JSON.stringify(crawlResult),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Perform AI analysis and schema generation in parallel
    const [aiAnalysis, schemaMarkup] = await Promise.all([
      analyzeWithAI(crawlResult),
      generateSchemaMarkup(crawlResult)
    ]);

    const analysisResult: AnalysisResult = {
      url: crawlResult.url!,
      title: crawlResult.title,
      metaDescription: crawlResult.metaDescription,
      headings: crawlResult.headings!,
      images: crawlResult.images!,
      pageSpeedInsights: pageSpeedResult,
      aiAnalysis,
      schemaMarkup,
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

      const recommendations = {
        high_priority: issues_found > 5 ? ['Fix critical SEO issues'] : [],
        medium_priority: pageSpeedResult ? ['Improve page speed'] : [],
        low_priority: ['Optimize images', 'Add structured data'],
        ai_suggestions: aiAnalysis?.improvementSuggestions || [],
        schema_markup: schemaMarkup ? [schemaMarkup] : []
      };

      await supabase
        .from('seo_analysis')
        .insert({
          project_id: projectId,
          analysis_data: analysisResult,
          issues_found,
          recommendations
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
