
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface InternalLinksRequest {
  content: string;
  links: Array<{
    url: string;
    anchor: string;
    description?: string;
  }>;
}

interface InternalLinksResponse {
  modifiedContent: string;
  insertedLinks: Array<{
    anchor: string;
    url: string;
    position: string;
    context: string;
  }>;
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

    const { content, links }: InternalLinksRequest = await req.json();

    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    if (!links || links.length === 0) {
      throw new Error('At least one internal link is required');
    }

    console.log('Processing internal links for content length:', content.length);
    console.log('Available links:', links.length);

    const prompt = `
You are an expert SEO content editor specializing in internal linking strategy. Your task is to analyze the provided content and strategically insert internal links at the most natural and contextually relevant positions.

CONTENT TO ANALYZE:
${content}

AVAILABLE INTERNAL LINKS:
${links.map((link, index) => `${index + 1}. Anchor: "${link.anchor}" → URL: ${link.url}${link.description ? ` (${link.description})` : ''}`).join('\n')}

INSTRUCTIONS:
1. Analyze the content for contextually relevant locations where each internal link would add value
2. Insert links naturally within sentences, not forced or awkward
3. Prioritize linking relevant keywords that match the anchor text or related concepts
4. Avoid over-linking - maximum 2-3 links per paragraph
5. Don't link the same anchor text multiple times unless it appears in very different contexts
6. Consider user experience - links should help readers find related information
7. Maintain the original content structure and formatting

RESPONSE FORMAT:
Return a JSON object with:
- modifiedContent: The original content with internal links inserted as HTML anchor tags
- insertedLinks: Array of objects describing each inserted link with:
  - anchor: The anchor text used
  - url: The URL linked to
  - position: Brief description of where it was inserted (e.g., "paragraph 3, discussing benefits")
  - context: The sentence or phrase where the link was inserted

Guidelines for link insertion:
- Use HTML format: <a href="URL">anchor text</a>
- Preserve all original formatting, line breaks, and structure
- Insert links seamlessly into existing sentences
- Choose the most relevant and natural anchor text positions
- If an anchor text doesn't fit naturally anywhere, don't force it

Focus on creating a natural reading experience while maximizing SEO value through strategic internal linking.
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
            content: 'You are an expert SEO content editor specializing in natural internal linking strategies that enhance user experience and search engine optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Validate and structure the response
    const internalLinksResponse: InternalLinksResponse = {
      modifiedContent: result.modifiedContent || content,
      insertedLinks: Array.isArray(result.insertedLinks) ? result.insertedLinks.map((link: any) => ({
        anchor: link.anchor || '',
        url: link.url || '',
        position: link.position || '',
        context: link.context || ''
      })) : []
    };

    console.log('Internal links processed successfully');
    console.log('Links inserted:', internalLinksResponse.insertedLinks.length);

    return new Response(
      JSON.stringify(internalLinksResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Internal links processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process internal links'
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
