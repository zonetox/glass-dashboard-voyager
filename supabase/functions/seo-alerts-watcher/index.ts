import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEOAlert {
  type: 'ranking' | 'pagespeed' | 'content' | 'technical';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  link?: string;
  data?: any;
}

interface AnalysisData {
  currentScore: number;
  previousScore?: number;
  pageSpeed: {
    mobile: number;
    desktop: number;
  };
  issues: any[];
  contentChanges: any[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function analyzeWebsite(domain: string): Promise<AnalysisData> {
  try {
    // Call existing analyze-website function to get current data
    const { data: analysisResult } = await supabase.functions.invoke('analyze-website', {
      body: { url: domain }
    });

    if (!analysisResult) {
      throw new Error('Failed to analyze website');
    }

    // Call pagespeed analysis
    const { data: pageSpeedResult } = await supabase.functions.invoke('pagespeed-analysis', {
      body: { url: domain }
    });

    return {
      currentScore: analysisResult.seoScore || 0,
      pageSpeed: {
        mobile: pageSpeedResult?.mobile?.score || 0,
        desktop: pageSpeedResult?.desktop?.score || 0
      },
      issues: analysisResult.issues || [],
      contentChanges: []
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw error;
  }
}

async function getHistoricalData(domain: string, userId: string): Promise<any> {
  try {
    // Get latest scan data for comparison
    const { data: scans } = await supabase
      .from('scans')
      .select('*')
      .eq('url', domain)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2);

    return scans || [];
  } catch (error) {
    console.error('Error getting historical data:', error);
    return [];
  }
}

function detectAnomalies(current: AnalysisData, historical: any[]): SEOAlert[] {
  const alerts: SEOAlert[] = [];

  // Check for significant SEO score drops
  if (historical.length > 0) {
    const previousScore = historical[0]?.seo?.overallScore || 0;
    const scoreDrop = previousScore - current.currentScore;

    if (scoreDrop > 20) {
      alerts.push({
        type: 'ranking',
        severity: 'critical',
        message: `SEO score dropped significantly from ${previousScore} to ${current.currentScore}`,
        data: { previousScore, currentScore: current.currentScore, drop: scoreDrop }
      });
    } else if (scoreDrop > 10) {
      alerts.push({
        type: 'ranking',
        severity: 'warning',
        message: `SEO score decreased from ${previousScore} to ${current.currentScore}`,
        data: { previousScore, currentScore: current.currentScore, drop: scoreDrop }
      });
    }
  }

  // Check PageSpeed issues
  if (current.pageSpeed.mobile < 50) {
    alerts.push({
      type: 'pagespeed',
      severity: 'critical',
      message: `Mobile PageSpeed score is critically low: ${current.pageSpeed.mobile}`,
      data: { mobile: current.pageSpeed.mobile, desktop: current.pageSpeed.desktop }
    });
  } else if (current.pageSpeed.mobile < 70) {
    alerts.push({
      type: 'pagespeed',
      severity: 'warning',
      message: `Mobile PageSpeed score needs improvement: ${current.pageSpeed.mobile}`,
      data: { mobile: current.pageSpeed.mobile, desktop: current.pageSpeed.desktop }
    });
  }

  if (current.pageSpeed.desktop < 60) {
    alerts.push({
      type: 'pagespeed',
      severity: 'warning',
      message: `Desktop PageSpeed score is low: ${current.pageSpeed.desktop}`,
      data: { mobile: current.pageSpeed.mobile, desktop: current.pageSpeed.desktop }
    });
  }

  // Check for critical SEO issues
  const criticalIssues = current.issues.filter(issue => 
    issue.priority === 'high' || issue.type === 'critical'
  );

  if (criticalIssues.length > 0) {
    alerts.push({
      type: 'technical',
      severity: 'critical',
      message: `Found ${criticalIssues.length} critical SEO issues that need immediate attention`,
      data: { issues: criticalIssues.slice(0, 3) } // Show top 3 issues
    });
  }

  // Check for new issues
  if (historical.length > 0) {
    const previousIssues = historical[0]?.seo?.issues || [];
    const newIssues = current.issues.filter(issue => 
      !previousIssues.some((prev: any) => prev.type === issue.type)
    );

    if (newIssues.length > 0) {
      alerts.push({
        type: 'technical',
        severity: 'info',
        message: `Detected ${newIssues.length} new SEO issues`,
        data: { newIssues: newIssues.slice(0, 3) }
      });
    }
  }

  return alerts;
}

async function saveAlerts(alerts: SEOAlert[], domain: string, userId: string): Promise<void> {
  try {
    const alertsToInsert = alerts.map(alert => ({
      user_id: userId,
      domain,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      link: alert.link,
      data: alert.data || {}
    }));

    if (alertsToInsert.length > 0) {
      const { error } = await supabase
        .from('alerts')
        .insert(alertsToInsert);

      if (error) {
        console.error('Error saving alerts:', error);
        throw error;
      }

      console.log(`Saved ${alertsToInsert.length} alerts for domain: ${domain}`);
    }
  } catch (error) {
    console.error('Error in saveAlerts:', error);
    throw error;
  }
}

async function sendEmailAlert(alerts: SEOAlert[], domain: string, userEmail: string): Promise<void> {
  try {
    const criticalAlerts = alerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'emergency'
    );

    if (criticalAlerts.length > 0) {
      await supabase.functions.invoke('send-email-event', {
        body: {
          email: userEmail,
          emailType: 'seo-alert',
          templateData: {
            websiteUrl: domain,
            alertsCount: criticalAlerts.length,
            alerts: criticalAlerts,
            dashboardUrl: `${Deno.env.get('SITE_URL')}/dashboard`
          }
        }
      });

      console.log(`Sent email alert to ${userEmail} for ${criticalAlerts.length} critical alerts`);
    }
  } catch (error) {
    console.error('Error sending email alert:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, userId, userEmail, isScheduled = false } = await req.json();

    if (!domain || !userId) {
      return new Response(
        JSON.stringify({ error: 'Domain and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting SEO alerts analysis for domain: ${domain}, user: ${userId}`);

    // Analyze current website state
    const currentAnalysis = await analyzeWebsite(domain);

    // Get historical data for comparison
    const historicalData = await getHistoricalData(domain, userId);

    // Detect anomalies and generate alerts
    const alerts = detectAnomalies(currentAnalysis, historicalData);

    // Save alerts to database
    if (alerts.length > 0) {
      await saveAlerts(alerts, domain, userId);

      // Send email alerts for critical issues (only for scheduled runs)
      if (isScheduled && userEmail) {
        await sendEmailAlert(alerts, domain, userEmail);
      }
    }

    const response = {
      success: true,
      domain,
      alertsGenerated: alerts.length,
      alerts: alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        message: alert.message
      })),
      analysis: {
        currentScore: currentAnalysis.currentScore,
        pageSpeed: currentAnalysis.pageSpeed,
        issuesCount: currentAnalysis.issues.length
      }
    };

    console.log(`SEO alerts analysis completed. Generated ${alerts.length} alerts.`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in seo-alerts-watcher function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});