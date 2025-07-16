import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordPressPostData {
  title: string;
  content: string;
  slug?: string;
  publishDate?: string;
  status?: 'draft' | 'publish' | 'future';
}

interface WordPressCredentials {
  url: string;
  username: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      wordpressUrl, 
      username, 
      password, 
      title, 
      content, 
      slug, 
      publishDate 
    } = await req.json();

    console.log('Received WordPress publishing request:', { 
      wordpressUrl, 
      username, 
      title: title?.substring(0, 50) + '...' 
    });

    // Validate inputs
    if (!wordpressUrl || !username || !password || !title || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: wordpressUrl, username, password, title, content' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare WordPress API endpoint
    const apiUrl = `${wordpressUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
    
    // Determine post status based on publish date
    let status = 'draft';
    let date = null;
    
    if (publishDate) {
      const publishDateTime = new Date(publishDate);
      const now = new Date();
      
      if (publishDateTime > now) {
        status = 'future';
        date = publishDateTime.toISOString();
      } else {
        status = 'publish';
        date = publishDateTime.toISOString();
      }
    }

    // Prepare post data
    const postData: any = {
      title: title,
      content: content,
      status: status,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    if (date) {
      postData.date = date;
    }

    console.log('Posting to WordPress:', { apiUrl, status, date });

    // Create Basic Auth header
    const credentials = btoa(`${username}:${password}`);
    
    // Make request to WordPress REST API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WordPress API error:', responseData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: responseData.message || 'Failed to publish to WordPress',
          details: responseData
        }), 
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully published to WordPress:', responseData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: responseData.id,
        postUrl: responseData.link,
        status: responseData.status,
        message: `Post successfully ${status === 'future' ? 'scheduled' : status === 'publish' ? 'published' : 'saved as draft'}`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in schedule-to-wordpress function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});