import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublishRequest {
  draftId: string
  siteIds: string[]
  publishDate?: string
}

interface WordPressSite {
  id: string
  site_name: string
  site_url: string
  application_password: string
  default_category: string
  default_status: string
}

interface ContentDraft {
  id: string
  content: string
  content_plans: {
    title: string
    main_keyword: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { draftId, siteIds, publishDate }: PublishRequest = await req.json()

    console.log('Multi-site publish request:', { draftId, siteIds: siteIds.length, publishDate })

    // Validate inputs
    if (!draftId || !siteIds || siteIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: draftId, siteIds' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get draft content
    const { data: draft, error: draftError } = await supabase
      .from('content_drafts')
      .select(`
        id,
        content,
        content_plans (
          title,
          main_keyword
        )
      `)
      .eq('id', draftId)
      .single()

    if (draftError || !draft) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Draft not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get WordPress sites
    const { data: sites, error: sitesError } = await supabase
      .from('wordpress_sites')
      .select('*')
      .in('id', siteIds)

    if (sitesError || !sites || sites.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid WordPress sites found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Publishing to ${sites.length} sites`)

    const results = []
    let successCount = 0

    // Publish to each site sequentially
    for (const site of sites) {
      try {
        console.log(`Publishing to ${site.site_name} (${site.site_url})`)

        // Prepare post data
        const postData = {
          title: draft.content_plans?.title || 'Untitled',
          content: draft.content || '',
          status: site.default_status,
          categories: [site.default_category],
        }

        if (publishDate) {
          const publishDateTime = new Date(publishDate)
          const now = new Date()
          
          if (publishDateTime > now) {
            postData.status = 'future'
            postData.date = publishDateTime.toISOString()
          }
        }

        // Create Basic Auth header
        const credentials = btoa(`admin:${site.application_password}`)
        
        // Make request to WordPress REST API
        const response = await fetch(`${site.site_url}/wp-json/wp/v2/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(postData)
        })

        if (response.ok) {
          const result = await response.json()
          successCount++
          
          results.push({
            siteId: site.id,
            siteName: site.site_name,
            siteUrl: site.site_url,
            success: true,
            postId: result.id,
            postUrl: result.link,
            message: `Published successfully`
          })

          console.log(`✓ Successfully published to ${site.site_name}`)
        } else {
          const errorData = await response.json()
          results.push({
            siteId: site.id,
            siteName: site.site_name,
            siteUrl: site.site_url,
            success: false,
            error: errorData.message || `HTTP ${response.status}`,
            message: `Failed to publish`
          })

          console.log(`✗ Failed to publish to ${site.site_name}: ${errorData.message}`)
        }

      } catch (error) {
        results.push({
          siteId: site.id,
          siteName: site.site_name,
          siteUrl: site.site_url,
          success: false,
          error: error.message,
          message: `Connection error`
        })

        console.log(`✗ Error publishing to ${site.site_name}: ${error.message}`)
      }

      // Add small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Update draft with published sites info
    const publishedSites = results.filter(r => r.success)
    if (publishedSites.length > 0) {
      const { error: updateError } = await supabase
        .from('content_drafts')
        .update({
          status: 'published',
          published_sites: publishedSites,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)

      if (updateError) {
        console.error('Error updating draft status:', updateError)
      }
    }

    const response = {
      success: true,
      message: `Published to ${successCount} out of ${sites.length} sites`,
      totalSites: sites.length,
      successfulPublications: successCount,
      failedPublications: sites.length - successCount,
      results
    }

    console.log('Multi-site publish completed:', response)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Multi-site publish error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})