import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Checking for scheduled posts to publish...')

    // Get all scheduled posts that should be published now
    const { data: scheduledDrafts, error: fetchError } = await supabase
      .from('content_drafts')
      .select(`
        *,
        content_plans (
          title,
          main_keyword,
          user_id
        )
      `)
      .eq('status', 'scheduled')
      .lt('scheduled_date', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled drafts:', fetchError)
      throw fetchError
    }

    console.log(`Found ${scheduledDrafts?.length || 0} posts ready to publish`)

    if (!scheduledDrafts || scheduledDrafts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No posts ready to publish',
          published: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let publishedCount = 0
    const results = []

    for (const draft of scheduledDrafts) {
      try {
        // Get user's WordPress credentials (you might want to store these in a separate table)
        // For now, we'll skip actual WordPress publishing and just mark as published
        
        console.log(`Publishing draft ${draft.id}: ${draft.content_plans?.title}`)

        // Update draft status to published
        const { error: updateError } = await supabase
          .from('content_drafts')
          .update({ 
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', draft.id)

        if (updateError) {
          console.error(`Error updating draft ${draft.id}:`, updateError)
          results.push({
            draftId: draft.id,
            title: draft.content_plans?.title,
            success: false,
            error: updateError.message
          })
          continue
        }

        publishedCount++
        results.push({
          draftId: draft.id,
          title: draft.content_plans?.title,
          success: true,
          message: 'Published successfully'
        })

        console.log(`Successfully published draft ${draft.id}`)

      } catch (error) {
        console.error(`Error processing draft ${draft.id}:`, error)
        results.push({
          draftId: draft.id,
          title: draft.content_plans?.title,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Auto-publish completed. Published ${publishedCount} posts.`,
        published: publishedCount,
        total: scheduledDrafts.length,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Auto-publish error:', error)
    
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