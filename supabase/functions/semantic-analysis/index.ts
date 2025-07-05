
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface SemanticAnalysisRequest {
  content: string;
  url?: string;
}

interface SemanticAnalysisResponse {
  mainTopic: string;
  subtopics: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  suggestedImprovements: string[];
  contentOutline: Array<{
    section: string;
    subsections: string[];
  }>;
  semanticGaps: string[];
  topicalDepthScore: number;
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

    const { content, url }: SemanticAnalysisRequest = await req.json();

    if (!content || content.trim().length === 0) {
      throw new Error('Content is required for semantic analysis');
    }

    console.log('Starting semantic analysis for:', url || 'provided content');

    const prompt = `
Analyze the following web page content for semantic SEO optimization. Provide a comprehensive analysis including:

1. Main topic identification
2. Missing semantic subtopics that should be covered
3. Content outline suggestions for better topical depth
4. Semantic gaps that hurt Google rankings

Content to analyze:
${content.substring(0, 5000)}${content.length > 5000 ? '...' : ''}

Respond with a JSON object containing:
- mainTopic: The primary topic/theme of the content
- subtopics: Array of 3-5 missing subtopics with title, description, and priority
- suggestedImprovements: Array of specific improvements to make
- contentOutline: Suggested article structure with sections and subsections
- semanticGaps: Missing semantic elements that competitors likely cover
- topicalDepthScore: Score from 1-100 on how comprehensively the topic is covered

Focus on semantic SEO best practices and what Google's algorithms expect for comprehensive topic coverage.
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
            content: 'You are an expert SEO analyst specializing in semantic search optimization and topic clusters. Provide detailed, actionable insights for improving content topical depth and semantic relevance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    // Validate and structure the response
    const semanticAnalysis: SemanticAnalysisResponse = {
      mainTopic: analysisResult.mainTopic || 'Unknown Topic',
      subtopics: Array.isArray(analysisResult.subtopics) ? analysisResult.subtopics : [],
      suggestedImprovements: Array.isArray(analysisResult.suggestedImprovements) ? analysisResult.suggestedImprovements : [],
      contentOutline: Array.isArray(analysisResult.contentOutline) ? analysisResult.contentOutline : [],
      semanticGaps: Array.isArray(analysisResult.semanticGaps) ? analysisResult.semanticGaps : [],
      topicalDepthScore: analysisResult.topicalDepthScore || 0
    };

    console.log('Semantic analysis completed successfully');

    return new Response(
      JSON.stringify(semanticAnalysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Semantic analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to perform semantic analysis'
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
