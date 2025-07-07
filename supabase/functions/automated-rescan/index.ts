
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automated rescan check...');

    // Get all scheduled scans that are due
    const { data: dueScans, error: scanError } = await supabase
      .from('scheduled_scans')
      .select('*')
      .eq('is_active', true)
      .lte('next_scan_at', new Date().toISOString());

    if (scanError) {
      console.error('Error fetching due scans:', scanError);
      throw scanError;
    }

    console.log(`Found ${dueScans?.length || 0} due scans`);

    for (const scan of dueScans || []) {
      try {
        console.log(`Processing scan for ${scan.website_url}`);

        // Get the last scan result for comparison
        const { data: lastScan } = await supabase
          .from('scan_results')
          .select('seo_score')
          .eq('user_id', scan.user_id)
          .eq('website_url', scan.website_url)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Trigger a new scan
        const { data: scanResult, error: newScanError } = await supabase.functions.invoke(
          'analyze-website',
          {
            body: { 
              url: scan.website_url,
              userId: scan.user_id 
            }
          }
        );

        if (newScanError) {
          console.error(`Error scanning ${scan.website_url}:`, newScanError);
          continue;
        }

        // Compare scores and create comparison record
        const currentScore = scanResult?.seoScore || 0;
        const previousScore = lastScan?.seo_score || 0;
        const scoreChange = currentScore - previousScore;

        await supabase
          .from('scan_comparisons')
          .insert({
            user_id: scan.user_id,
            website_url: scan.website_url,
            previous_seo_score: previousScore,
            current_seo_score: currentScore,
            score_change: scoreChange,
            new_issues: scanResult?.issues || [],
            fixed_issues: []
          });

        // Send alert if score decreased or new issues found
        if (scan.email_alerts && (scoreChange < 0 || (scanResult?.issues?.length || 0) > 0)) {
          await supabase.functions.invoke('send-scan-alert', {
            body: {
              userId: scan.user_id,
              websiteUrl: scan.website_url,
              scoreChange,
              currentScore,
              previousScore,
              newIssues: scanResult?.issues || []
            }
          });
        }

        // Auto-optimize if enabled
        if (scan.auto_optimize && scoreChange < -5) {
          await supabase.functions.invoke('optimize-website', {
            body: {
              url: scan.website_url,
              userId: scan.user_id
            }
          });
        }

        // Update next scan date
        const nextScanDate = new Date();
        nextScanDate.setDate(nextScanDate.getDate() + scan.frequency_days);

        await supabase
          .from('scheduled_scans')
          .update({
            last_scan_at: new Date().toISOString(),
            next_scan_at: nextScanDate.toISOString()
          })
          .eq('id', scan.id);

        console.log(`Completed scan for ${scan.website_url}`);

      } catch (error) {
        console.error(`Error processing scan for ${scan.website_url}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedScans: dueScans?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in automated-rescan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
