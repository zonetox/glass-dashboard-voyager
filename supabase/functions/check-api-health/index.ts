import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time and 24 hours ago
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))

    console.log('Checking API health for the last 24 hours...')

    // Query scans table for records in the last 24 hours
    const { data: recentScans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })

    if (scansError) {
      console.error('Error fetching scans:', scansError)
      throw scansError
    }

    // Calculate metrics
    const scanRecordsLast24h = recentScans?.length || 0
    const lastScan = recentScans?.[0]
    const lastScanTime = lastScan?.created_at || null

    // Get a sample AI analysis
    const aiAnalysisSample = lastScan?.ai_analysis || null

    // Determine analyze-site status
    let analyzeSiteStatus: "OK" | "NO_CALL" | "ERROR" = "NO_CALL"
    
    if (scanRecordsLast24h > 0) {
      // Check if any scans have errors in AI analysis
      const hasErrors = recentScans?.some(scan => 
        scan.ai_analysis?.error || 
        !scan.ai_analysis ||
        JSON.stringify(scan.ai_analysis).includes('error')
      )
      
      analyzeSiteStatus = hasErrors ? "ERROR" : "OK"
    }

    // Try to get error logs from Supabase Analytics (if available)
    const errorLogs: string[] = []
    
    try {
      // Query function edge logs for analyze-site function
      const { data: functionLogs, error: logsError } = await supabase
        .from('function_edge_logs')
        .select('*')
        .contains('metadata', { function_id: 'analyze-site' })
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50)

      if (!logsError && functionLogs) {
        functionLogs.forEach(log => {
          const metadata = log.metadata?.[0]
          const response = metadata?.response?.[0]
          
          if (response?.status_code >= 400) {
            errorLogs.push(`${log.timestamp}: HTTP ${response.status_code} - ${log.event_message}`)
          }
          
          if (log.event_message?.includes('error') || log.event_message?.includes('timeout')) {
            errorLogs.push(`${log.timestamp}: ${log.event_message}`)
          }
        })
      }
    } catch (logsErr) {
      console.log('Could not fetch function logs (this is normal if not available):', logsErr)
      errorLogs.push('Could not access function logs - limited visibility')
    }

    // Additional error detection from scan data
    if (recentScans) {
      recentScans.forEach(scan => {
        if (scan.ai_analysis?.error) {
          errorLogs.push(`${scan.created_at}: AI Analysis Error - ${scan.ai_analysis.error}`)
        }
        
        if (!scan.ai_analysis) {
          errorLogs.push(`${scan.created_at}: Missing AI Analysis data`)
        }
      })
    }

    const healthReport = {
      analyzeSiteStatus,
      scanRecordsLast24h,
      lastScanTime,
      aiAnalysisSample,
      errorLogs: errorLogs.slice(0, 10), // Limit to 10 most recent errors
      checkedAt: now.toISOString(),
      summary: {
        totalScans: scanRecordsLast24h,
        hasRecentActivity: scanRecordsLast24h > 0,
        hasErrors: errorLogs.length > 0,
        lastActivityHoursAgo: lastScanTime ? 
          Math.round((now.getTime() - new Date(lastScanTime).getTime()) / (1000 * 60 * 60)) : 
          null
      }
    }

    console.log('API health check completed:', healthReport.summary)

    return new Response(
      JSON.stringify(healthReport),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Health check failed:', error)
    
    return new Response(
      JSON.stringify({ 
        analyzeSiteStatus: "ERROR",
        scanRecordsLast24h: 0,
        lastScanTime: null,
        aiAnalysisSample: null,
        errorLogs: [`Health check failed: ${error.message}`],
        checkedAt: new Date().toISOString()
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