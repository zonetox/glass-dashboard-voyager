
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface ContentClusterRequest {
  keyword: string;
}

interface PillarPage {
  title: string;
  meta_description: string;
  purpose: string;
  target_keywords: string[];
}

interface ClusterArticle {
  title: string;
  meta_description: string;
  purpose: string;
  link_to_pillar: string;
  target_keywords: string[];
}

interface ContentClusterResponse {
  pillar: PillarPage;
  clusters: ClusterArticle[];
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { keyword }: ContentClusterRequest = await req.json();

    if (!keyword || keyword.trim().length === 0) {
      throw new Error('Primary keyword is required');
    }

    console.log('Generating content cluster for keyword:', keyword);

    const prompt = `
Create a comprehensive content cluster strategy for the primary keyword: "${keyword}"

Generate:
1. One pillar page that covers the topic comprehensively
2. 5-8 supporting cluster articles that link back to the pillar page
3. Each article should have a clear purpose and connection to the pillar

For each piece of content, provide:
- SEO-optimized title (60 characters or less)
- Meta description (155 characters or less)
- Clear purpose/description
- Target keywords (2-4 per article)
- For cluster articles: explain how they link to the pillar page

Respond with a JSON object containing:
- pillar: {title, meta_description, purpose, target_keywords}
- clusters: [{title, meta_description, purpose, link_to_pillar, target_keywords}]

Focus on creating a logical content hierarchy that establishes topical authority and covers all aspects users would search for related to "${keyword}".
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content strategist who creates comprehensive content clusters that establish topical authority and improve search rankings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const contentCluster = JSON.parse(data.choices[0].message.content);

    // Validate and structure the response
    const clusterResponse: ContentClusterResponse = {
      pillar: {
        title: contentCluster.pillar?.title || 'Untitled Pillar Page',
        meta_description: contentCluster.pillar?.meta_description || '',
        purpose: contentCluster.pillar?.purpose || '',
        target_keywords: Array.isArray(contentCluster.pillar?.target_keywords) ? contentCluster.pillar.target_keywords : []
      },
      clusters: Array.isArray(contentCluster.clusters) ? contentCluster.clusters.map((cluster: any) => ({
        title: cluster.title || 'Untitled Article',
        meta_description: cluster.meta_description || '',
        purpose: cluster.purpose || '',
        link_to_pillar: cluster.link_to_pillar || '',
        target_keywords: Array.isArray(cluster.target_keywords) ? cluster.target_keywords : []
      })) : []
    };

    console.log('Content cluster generated successfully');

    return new Response(
      JSON.stringify(clusterResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Content cluster generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate content cluster'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
