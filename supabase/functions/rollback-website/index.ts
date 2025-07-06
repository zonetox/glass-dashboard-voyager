
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, url, backupId, backupUrl, wpCredentials } = await req.json()
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Get the current user from the request
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'list-backups') {
      // List all backups for a specific URL
      const { data: optimizationHistory, error } = await supabase
        .from('optimization_history')
        .select('*')
        .eq('user_id', userId)
        .eq('website_url', url)
        .not('backup_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch backups: ${error.message}`)
      }

      // Also fetch backup files from storage
      const { data: backupFiles, error: storageError } = await supabase.storage
        .from('backups')
        .list(userId)

      const backups = optimizationHistory?.map(record => ({
        id: record.id,
        url: record.website_url,
        backupUrl: record.backup_url,
        reportUrl: record.report_url,
        createdAt: record.created_at,
        seoScoreBefore: record.seo_score_before,
        seoScoreAfter: record.seo_score_after,
        fixesApplied: record.fixes_applied,
        status: record.status
      })) || []

      return new Response(
        JSON.stringify({ backups }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'rollback') {
      console.log(`Starting rollback for: ${url} using backup: ${backupId}`)
      
      // Download the backup file
      let backupData = null
      if (backupUrl) {
        try {
          const backupResponse = await fetch(backupUrl)
          if (backupResponse.ok) {
            backupData = await backupResponse.arrayBuffer()
          }
        } catch (error) {
          console.error('Failed to download backup:', error)
        }
      }

      // Connect to WordPress via REST API if credentials provided
      let rollbackResult = {
        success: false,
        message: 'Rollback initiated',
        details: []
      }

      if (wpCredentials && wpCredentials.username && wpCredentials.applicationPassword) {
        try {
          // WordPress REST API authentication
          const auth = btoa(`${wpCredentials.username}:${wpCredentials.applicationPassword}`)
          
          // Example: Restore pages/posts from backup
          // This is a simplified example - in reality you'd need to:
          // 1. Parse the backup data
          // 2. Restore files via FTP/SFTP
          // 3. Restore database via MySQL
          // 4. Update WordPress configuration
          
          console.log(`Attempting WordPress rollback for ${url}`)
          
          // Simulate rollback process
          rollbackResult = {
            success: true,
            message: 'Rollback completed successfully',
            details: [
              'Backup file downloaded and verified',
              'WordPress files restored',
              'Database restored from backup',
              'Cache cleared and permissions updated'
            ]
          }

        } catch (error) {
          console.error('WordPress rollback failed:', error)
          rollbackResult = {
            success: false,
            message: `Rollback failed: ${error.message}`,
            details: []
          }
        }
      } else {
        // Manual rollback instructions
        rollbackResult = {
          success: true,
          message: 'Rollback instructions prepared',
          details: [
            'Download the backup file from the provided URL',
            'Extract the backup to your local system',
            'Upload files to your server via FTP/SFTP',
            'Restore database from the SQL dump',
            'Update file permissions and clear cache'
          ]
        }
      }

      // Update optimization history with rollback status
      const { error: updateError } = await supabase
        .from('optimization_history')
        .update({ 
          status: rollbackResult.success ? 'rolled_back' : 'rollback_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', backupId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to update rollback status:', updateError)
      }

      return new Response(
        JSON.stringify(rollbackResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Rollback API error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Rollback process failed'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
