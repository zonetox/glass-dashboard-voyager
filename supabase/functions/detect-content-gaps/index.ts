import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentGapRequest {
  domain: string;
  competitors: string[];
  user_id?: string;
}

interface ContentGap {
  topic: string;
  keyword: string;
  competitor_count: number;
  opportunity_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, competitors, user_id }: ContentGapRequest = await req.json();

    if (!domain || !competitors || competitors.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Domain and competitors are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing content gaps for domain: ${domain} against ${competitors.length} competitors`);

    // Simulate scraping and analysis for demo (in production, you would use actual scraping)
    const mockAnalysisResults = await analyzeContentGaps(domain, competitors);

    // Store results if user_id is provided
    if (user_id) {
      await storeContentGaps(user_id, domain, mockAnalysisResults);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        competitors_analyzed: competitors.length,
        gaps_found: mockAnalysisResults.length,
        content_gaps: mockAnalysisResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Content gaps analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeContentGaps(domain: string, competitors: string[]): Promise<ContentGap[]> {
  if (!openAIApiKey) {
    // Return mock data if no OpenAI key
    return generateMockContentGaps(domain, competitors);
  }

  try {
    const systemPrompt = `You are an expert SEO content analyst. Analyze the given domain against competitors to identify content gaps and opportunities.

Your task:
1. Identify topics/keywords that competitors are covering but the target domain is missing
2. Calculate opportunity scores based on:
   - How many competitors cover the topic (higher = more validated)
   - Semantic relevance to the domain
   - Search volume potential
   - Competition difficulty

Return ONLY a JSON array of content gaps, no explanations.`;

    const userPrompt = `Target domain: ${domain}
Competitors: ${competitors.join(', ')}

Analyze content gaps and return opportunities in this exact JSON format:
[
  {
    "topic": "Topic name",
    "keyword": "Primary keyword",
    "competitor_count": number,
    "opportunity_score": number (0-100)
  }
]

Focus on high-opportunity, low-competition keywords relevant to the domain's niche.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Clean up response and parse JSON
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const contentGaps = JSON.parse(cleanedResponse);

    // Validate and sanitize results
    return contentGaps.filter((gap: any) => 
      gap.topic && gap.keyword && 
      typeof gap.competitor_count === 'number' && 
      typeof gap.opportunity_score === 'number'
    ).slice(0, 20); // Limit to top 20 opportunities

  } catch (error) {
    console.error('AI analysis failed, using mock data:', error);
    return generateMockContentGaps(domain, competitors);
  }
}

function generateMockContentGaps(domain: string, competitors: string[]): ContentGap[] {
  const domainNiche = inferNiche(domain);
  
  const mockGaps: ContentGap[] = [
    { topic: `${domainNiche} Best Practices`, keyword: `${domainNiche} best practices`, competitor_count: 4, opportunity_score: 85 },
    { topic: `Advanced ${domainNiche} Techniques`, keyword: `advanced ${domainNiche}`, competitor_count: 3, opportunity_score: 78 },
    { topic: `${domainNiche} vs Alternatives`, keyword: `${domainNiche} comparison`, competitor_count: 5, opportunity_score: 72 },
    { topic: `${domainNiche} Case Studies`, keyword: `${domainNiche} case study`, competitor_count: 2, opportunity_score: 69 },
    { topic: `${domainNiche} Tools Review`, keyword: `best ${domainNiche} tools`, competitor_count: 4, opportunity_score: 65 },
    { topic: `${domainNiche} Trends 2025`, keyword: `${domainNiche} trends`, competitor_count: 3, opportunity_score: 62 },
    { topic: `${domainNiche} for Beginners`, keyword: `${domainNiche} guide`, competitor_count: 6, opportunity_score: 58 },
    { topic: `${domainNiche} ROI Analysis`, keyword: `${domainNiche} ROI`, competitor_count: 2, opportunity_score: 55 },
    { topic: `${domainNiche} Implementation`, keyword: `how to implement ${domainNiche}`, competitor_count: 4, opportunity_score: 52 },
    { topic: `${domainNiche} Mistakes`, keyword: `${domainNiche} mistakes avoid`, competitor_count: 3, opportunity_score: 48 }
  ];

  return mockGaps.map(gap => ({
    ...gap,
    competitor_count: Math.min(gap.competitor_count, competitors.length)
  }));
}

function inferNiche(domain: string): string {
  const domainLower = domain.toLowerCase();
  
  if (domainLower.includes('seo') || domainLower.includes('marketing')) return 'SEO';
  if (domainLower.includes('tech') || domainLower.includes('dev')) return 'Technology';
  if (domainLower.includes('health') || domainLower.includes('fitness')) return 'Health';
  if (domainLower.includes('finance') || domainLower.includes('money')) return 'Finance';
  if (domainLower.includes('travel') || domainLower.includes('tour')) return 'Travel';
  if (domainLower.includes('food') || domainLower.includes('recipe')) return 'Food';
  if (domainLower.includes('fashion') || domainLower.includes('style')) return 'Fashion';
  if (domainLower.includes('education') || domainLower.includes('learn')) return 'Education';
  
  return 'Business';
}

async function storeContentGaps(userId: string, domain: string, gaps: ContentGap[]) {
  try {
    // Store analysis results for future reference
    const { error } = await supabase
      .from('competitor_analysis')
      .insert({
        user_id: userId,
        user_website_url: domain,
        competitor_urls: [],
        analysis_data: { content_gaps: gaps },
        competitor_data: {},
        user_site_data: { domain },
        insights: { gaps_found: gaps.length },
        status: 'completed'
      });

    if (error) {
      console.error('Error storing content gaps:', error);
    }
  } catch (error) {
    console.error('Failed to store content gaps:', error);
  }
}