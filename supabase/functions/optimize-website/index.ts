
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizationRequest {
  url: string;
  fixes: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    recommendation: string;
  }>;
  wpCredentials: {
    username: string;
    applicationPassword: string;
  };
  schemaMarkup?: {
    type: string;
    jsonLd: any;
  };
}

interface FixResult {
  id: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
}

async function getWordPressApiUrl(siteUrl: string): Promise<string> {
  try {
    // Try to detect WordPress REST API endpoint
    const baseUrl = new URL(siteUrl).origin;
    const apiUrl = `${baseUrl}/wp-json/wp/v2/`;
    
    // Test if the API is accessible
    const response = await fetch(apiUrl, { method: 'HEAD' });
    if (response.ok) {
      return apiUrl;
    }
    
    throw new Error('WordPress REST API not found');
  } catch (error) {
    throw new Error(`Cannot connect to WordPress site: ${error.message}`);
  }
}

async function makeWordPressRequest(
  endpoint: string, 
  method: string, 
  credentials: { username: string; applicationPassword: string },
  data?: any
) {
  const auth = btoa(`${credentials.username}:${credentials.applicationPassword}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WordPress API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function fixMetaTitle(apiUrl: string, credentials: any, recommendation: string): Promise<FixResult> {
  try {
    // Get the front page ID
    const settingsResponse = await makeWordPressRequest(`${apiUrl}settings`, 'GET', credentials);
    const pageOnFront = settingsResponse.page_on_front;
    
    if (!pageOnFront) {
      return { id: 'meta-title', status: 'skipped', message: 'No front page set' };
    }
    
    // Update the page title
    const newTitle = recommendation.includes('title') ? 
      recommendation.replace(/.*title[:\s]*["']?([^"']+)["']?.*/, '$1') : 
      'Optimized Page Title';
    
    await makeWordPressRequest(
      `${apiUrl}pages/${pageOnFront}`,
      'POST',
      credentials,
      { title: newTitle }
    );
    
    return { id: 'meta-title', status: 'success', message: 'Page title updated successfully' };
  } catch (error) {
    return { id: 'meta-title', status: 'failed', message: error.message };
  }
}

async function fixMetaDescription(apiUrl: string, credentials: any, recommendation: string): Promise<FixResult> {
  try {
    // This would typically require a SEO plugin like Yoast or RankMath
    // For now, we'll update the excerpt which can serve as meta description
    const settingsResponse = await makeWordPressRequest(`${apiUrl}settings`, 'GET', credentials);
    const pageOnFront = settingsResponse.page_on_front;
    
    if (!pageOnFront) {
      return { id: 'meta-description', status: 'skipped', message: 'No front page set' };
    }
    
    const newExcerpt = recommendation.includes('description') ? 
      recommendation.replace(/.*description[:\s]*["']?([^"']+)["']?.*/, '$1') : 
      'Optimized meta description for better SEO performance.';
    
    await makeWordPressRequest(
      `${apiUrl}pages/${pageOnFront}`,
      'POST',
      credentials,
      { excerpt: newExcerpt }
    );
    
    return { id: 'meta-description', status: 'success', message: 'Meta description updated via excerpt' };
  } catch (error) {
    return { id: 'meta-description', status: 'failed', message: error.message };
  }
}

async function fixHeadingStructure(apiUrl: string, credentials: any): Promise<FixResult> {
  try {
    const settingsResponse = await makeWordPressRequest(`${apiUrl}settings`, 'GET', credentials);
    const pageOnFront = settingsResponse.page_on_front;
    
    if (!pageOnFront) {
      return { id: 'heading-structure', status: 'skipped', message: 'No front page set' };
    }
    
    // Get current page content
    const pageResponse = await makeWordPressRequest(`${apiUrl}pages/${pageOnFront}`, 'GET', credentials);
    let content = pageResponse.content.rendered || pageResponse.content;
    
    // Simple heading structure fix - ensure there's an H1
    if (!content.includes('<h1')) {
      const title = pageResponse.title.rendered || 'Main Heading';
      content = `<h1>${title}</h1>\n${content}`;
      
      await makeWordPressRequest(
        `${apiUrl}pages/${pageOnFront}`,
        'POST',
        credentials,
        { content }
      );
      
      return { id: 'heading-structure', status: 'success', message: 'Added H1 heading to page' };
    }
    
    return { id: 'heading-structure', status: 'skipped', message: 'Heading structure already good' };
  } catch (error) {
    return { id: 'heading-structure', status: 'failed', message: error.message };
  }
}

async function fixImageAltText(apiUrl: string, credentials: any): Promise<FixResult> {
  try {
    // Get media items
    const mediaResponse = await makeWordPressRequest(`${apiUrl}media?per_page=20`, 'GET', credentials);
    
    let updatedCount = 0;
    for (const media of mediaResponse) {
      if (!media.alt_text || media.alt_text.trim() === '') {
        const altText = media.title?.rendered || `Image ${media.id}`;
        
        await makeWordPressRequest(
          `${apiUrl}media/${media.id}`,
          'POST',
          credentials,
          { alt_text: altText }
        );
        updatedCount++;
      }
    }
    
    return { 
      id: 'image-alt', 
      status: 'success', 
      message: `Updated alt text for ${updatedCount} images` 
    };
  } catch (error) {
    return { id: 'image-alt', status: 'failed', message: error.message };
  }
}

async function insertSchemaMarkup(
  apiUrl: string, 
  credentials: any, 
  schemaMarkup: { type: string; jsonLd: any }
): Promise<FixResult> {
  try {
    const settingsResponse = await makeWordPressRequest(`${apiUrl}settings`, 'GET', credentials);
    const pageOnFront = settingsResponse.page_on_front;
    
    if (!pageOnFront) {
      return { id: 'schema-markup', status: 'skipped', message: 'No front page set' };
    }
    
    // Get current page content
    const pageResponse = await makeWordPressRequest(`${apiUrl}pages/${pageOnFront}`, 'GET', credentials);
    let content = pageResponse.content.rendered || pageResponse.content;
    
    // Add schema markup as a script tag
    const schemaScript = `
<!-- SEO Auto Tool - Schema.org Markup -->
<script type="application/ld+json">
${JSON.stringify(schemaMarkup.jsonLd, null, 2)}
</script>`;
    
    // Check if schema already exists to avoid duplicates
    if (!content.includes('application/ld+json')) {
      content = content + schemaScript;
      
      await makeWordPressRequest(
        `${apiUrl}pages/${pageOnFront}`,
        'POST',
        credentials,
        { content }
      );
      
      return { 
        id: 'schema-markup', 
        status: 'success', 
        message: `Added ${schemaMarkup.type} schema markup` 
      };
    }
    
    return { id: 'schema-markup', status: 'skipped', message: 'Schema markup already exists' };
  } catch (error) {
    return { id: 'schema-markup', status: 'failed', message: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, fixes, wpCredentials, schemaMarkup }: OptimizationRequest = await req.json();

    if (!url || !fixes || !wpCredentials.username || !wpCredentials.applicationPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting optimization for: ${url}`);

    // Get WordPress API URL
    const apiUrl = await getWordPressApiUrl(url);
    const results: FixResult[] = [];

    // Apply fixes based on issue types
    for (const fix of fixes) {
      console.log(`Applying fix: ${fix.type}`);
      
      let result: FixResult;
      
      switch (fix.type) {
        case 'title':
          result = await fixMetaTitle(apiUrl, wpCredentials, fix.recommendation);
          break;
        case 'meta':
          result = await fixMetaDescription(apiUrl, wpCredentials, fix.recommendation);
          break;
        case 'heading':
          result = await fixHeadingStructure(apiUrl, wpCredentials);
          break;
        case 'image':
          result = await fixImageAltText(apiUrl, wpCredentials);
          break;
        default:
          result = { id: fix.id, status: 'skipped', message: `Fix type '${fix.type}' not supported` };
      }
      
      results.push(result);
    }

    // Insert schema markup if provided
    if (schemaMarkup) {
      const schemaResult = await insertSchemaMarkup(apiUrl, wpCredentials, schemaMarkup);
      results.push(schemaResult);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`Optimization completed: ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        successCount,
        failedCount,
        totalFixes: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimize-website function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
