
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, userId } = await req.json();

    // Get latest scan data for the website
    const { data: scanData } = await supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', userId)
      .eq('website_url', websiteUrl)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get scan history for trend analysis
    const { data: scanHistory } = await supabase
      .from('scan_results')
      .select('seo_score, created_at')
      .eq('user_id', userId)
      .eq('website_url', websiteUrl)
      .order('created_at', { ascending: false })
      .limit(10);

    const domain = new URL(websiteUrl).hostname;
    
    const prompt = `
    As an SEO Strategy Advisor, analyze this website and provide comprehensive strategic advice:

    Website: ${domain}
    Current SEO Score: ${scanData?.seo_score || 'Unknown'}
    Issues Count: ${scanData?.issues_count || 0}
    
    Score History: ${scanHistory?.map(h => `${h.seo_score} (${new Date(h.created_at || '').toLocaleDateString()})`).join(', ') || 'No history'}

    Provide strategic advice in these areas:

    1. **Current Website Status**
       - Overall health assessment
       - Strengths and weaknesses
       - Performance trends

    2. **Content Expansion Opportunities**
       - Topics to explore based on current content
       - Content gaps to fill
       - Seasonal content opportunities

    3. **Content Types to Add**
       - Blog posts and guides
       - Product/service pages
       - FAQ sections
       - Testimonials and reviews
       - Case studies
       - Resource pages

    4. **Technical SEO Improvements**
       - Schema markup recommendations
       - Site structure improvements
       - Page speed optimizations

    5. **Industry-Specific Recommendations**
       - Analyze the website type/industry
       - Provide tailored advice for that sector
       - Competitor analysis insights

    Format the response as structured JSON with clear sections and actionable recommendations.
    `;

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
            content: 'You are an expert SEO strategist who provides comprehensive, actionable advice for website optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const aiResponse = await response.json();
    const advice = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true, 
        advice,
        websiteData: {
          domain,
          currentScore: scanData?.seo_score,
          issuesCount: scanData?.issues_count,
          lastScan: scanData?.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in strategy-advisor:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
