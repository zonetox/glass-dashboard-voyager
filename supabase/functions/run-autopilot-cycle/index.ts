import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AutoPilotUser {
  user_id: string;
  enabled: boolean;
  frequency_days: number;
  auto_fix_seo: boolean;
  auto_update_content: boolean;
  auto_generate_schema: boolean;
  send_reports: boolean;
  backup_before_fix: boolean;
  last_run?: string;
}

interface UserDomain {
  user_id: string;
  url: string;
  last_scan?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🤖 Starting AutoPilot cycle...');

  try {
    // 1. Get all users with AutoPilot enabled and due for processing
    const { data: autopilotUsers, error: autopilotError } = await supabase
      .from('user_autopilot')
      .select('*')
      .eq('enabled', true)
      .or(`last_run.is.null,last_run.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);

    if (autopilotError) {
      console.error('Error fetching autopilot users:', autopilotError);
      throw autopilotError;
    }

    console.log(`📊 Found ${autopilotUsers?.length || 0} users with AutoPilot enabled`);

    if (!autopilotUsers || autopilotUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users due for AutoPilot processing',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalProcessed = 0;
    const results = [];

    for (const autopilotUser of autopilotUsers) {
      try {
        console.log(`🔄 Processing user: ${autopilotUser.user_id}`);

        // Check if user is due for processing based on frequency
        if (autopilotUser.last_run) {
          const lastRun = new Date(autopilotUser.last_run);
          const nextRun = new Date(lastRun.getTime() + autopilotUser.frequency_days * 24 * 60 * 60 * 1000);
          if (new Date() < nextRun) {
            console.log(`⏰ User ${autopilotUser.user_id} not due yet. Next run: ${nextRun}`);
            continue;
          }
        }

        // 2. Get user's domains from scans table
        const { data: userDomains, error: domainsError } = await supabase
          .from('scans')
          .select('url, user_id, created_at')
          .eq('user_id', autopilotUser.user_id)
          .order('created_at', { ascending: false });

        if (domainsError) {
          console.error(`Error fetching domains for user ${autopilotUser.user_id}:`, domainsError);
          continue;
        }

        // Get unique domains
        const uniqueDomains = Array.from(
          new Map(userDomains?.map(d => [d.url, d]) || []).values()
        );

        console.log(`🌐 Found ${uniqueDomains.length} domains for user ${autopilotUser.user_id}`);

        const userResults = {
          user_id: autopilotUser.user_id,
          domains_processed: 0,
          actions_taken: [],
          reports_generated: [],
          errors: []
        };

        for (const domain of uniqueDomains.slice(0, 5)) { // Limit to 5 domains per user
          try {
            console.log(`🔍 Analyzing domain: ${domain.url}`);

            // 3. Call analyze-site function
            const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-site', {
              body: { 
                url: domain.url,
                user_id: autopilotUser.user_id,
                autopilot: true
              }
            });

            if (analysisError) {
              console.error(`Analysis error for ${domain.url}:`, analysisError);
              userResults.errors.push(`Analysis failed for ${domain.url}: ${analysisError.message}`);
              continue;
            }

            console.log(`✅ Analysis completed for ${domain.url}`);

            // 4. Create backup if enabled
            if (autopilotUser.backup_before_fix && analysisResult?.seo_score) {
              try {
                const { error: backupError } = await supabase.functions.invoke('backup-site', {
                  body: { 
                    url: domain.url,
                    user_id: autopilotUser.user_id,
                    type: 'autopilot_backup'
                  }
                });

                if (!backupError) {
                  userResults.actions_taken.push(`Backup created for ${domain.url}`);
                } else {
                  console.error(`Backup error for ${domain.url}:`, backupError);
                }
              } catch (error) {
                console.error(`Backup failed for ${domain.url}:`, error);
              }
            }

            // 5. Auto-fix SEO issues if enabled
            if (autopilotUser.auto_fix_seo && analysisResult?.issues?.length > 0) {
              try {
                const { error: fixError } = await supabase.functions.invoke('seo-html-suggestions', {
                  body: { 
                    url: domain.url,
                    user_id: autopilotUser.user_id,
                    auto_apply: true
                  }
                });

                if (!fixError) {
                  userResults.actions_taken.push(`SEO fixes applied to ${domain.url}`);
                } else {
                  console.error(`SEO fix error for ${domain.url}:`, fixError);
                }
              } catch (error) {
                console.error(`SEO fix failed for ${domain.url}:`, error);
              }
            }

            // 6. Auto-update content if enabled
            if (autopilotUser.auto_update_content) {
              try {
                const { error: contentError } = await supabase.functions.invoke('rewrite-content', {
                  body: { 
                    url: domain.url,
                    user_id: autopilotUser.user_id,
                    auto_mode: true
                  }
                });

                if (!contentError) {
                  userResults.actions_taken.push(`Content updated for ${domain.url}`);
                } else {
                  console.error(`Content update error for ${domain.url}:`, contentError);
                }
              } catch (error) {
                console.error(`Content update failed for ${domain.url}:`, error);
              }
            }

            // 7. Generate PDF report if enabled
            if (autopilotUser.send_reports) {
              try {
                const { data: reportResult, error: reportError } = await supabase.functions.invoke('generate-pdf-report', {
                  body: { 
                    url: domain.url,
                    user_id: autopilotUser.user_id,
                    report_type: 'autopilot_summary',
                    include_ai: true
                  }
                });

                if (!reportError && reportResult?.file_url) {
                  userResults.reports_generated.push({
                    domain: domain.url,
                    report_url: reportResult.file_url
                  });
                } else {
                  console.error(`Report generation error for ${domain.url}:`, reportError);
                }
              } catch (error) {
                console.error(`Report generation failed for ${domain.url}:`, error);
              }
            }

            userResults.domains_processed++;

          } catch (domainError) {
            console.error(`Error processing domain ${domain.url}:`, domainError);
            userResults.errors.push(`Failed to process ${domain.url}: ${domainError.message}`);
          }
        }

        // 8. Send email summary if reports are enabled
        if (autopilotUser.send_reports && userResults.domains_processed > 0) {
          try {
            await sendAutoPilotSummary(autopilotUser.user_id, userResults);
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            userResults.errors.push('Failed to send email summary');
          }
        }

        // Update last_run timestamp
        const { error: updateError } = await supabase
          .from('user_autopilot')
          .update({ 
            updated_at: new Date().toISOString(),
            // Store last successful run info in a custom field if needed
          })
          .eq('user_id', autopilotUser.user_id);

        if (updateError) {
          console.error(`Failed to update last_run for user ${autopilotUser.user_id}:`, updateError);
        }

        results.push(userResults);
        totalProcessed++;
        console.log(`✅ Completed processing for user ${autopilotUser.user_id}`);

      } catch (userError) {
        console.error(`Error processing user ${autopilotUser.user_id}:`, userError);
        results.push({
          user_id: autopilotUser.user_id,
          error: userError.message
        });
      }
    }

    console.log(`🎉 AutoPilot cycle completed. Processed ${totalProcessed} users.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: totalProcessed,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AutoPilot cycle error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function sendAutoPilotSummary(userId: string, results: any) {
  try {
    // Get user email from auth.users (this requires service role)
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user?.email) {
      console.error('Failed to get user email:', userError);
      return;
    }

    const emailContent = `
      <h2>🤖 AutoPilot SEO Summary</h2>
      <p>Your AutoPilot SEO cycle has completed successfully!</p>
      
      <h3>📊 Summary</h3>
      <ul>
        <li><strong>Domains Processed:</strong> ${results.domains_processed}</li>
        <li><strong>Actions Taken:</strong> ${results.actions_taken.length}</li>
        <li><strong>Reports Generated:</strong> ${results.reports_generated.length}</li>
      </ul>
      
      ${results.actions_taken.length > 0 ? `
      <h3>🔧 Actions Taken</h3>
      <ul>
        ${results.actions_taken.map((action: string) => `<li>${action}</li>`).join('')}
      </ul>
      ` : ''}
      
      ${results.reports_generated.length > 0 ? `
      <h3>📄 Generated Reports</h3>
      <ul>
        ${results.reports_generated.map((report: any) => 
          `<li><a href="${report.report_url}" target="_blank">${report.domain} Report</a></li>`
        ).join('')}
      </ul>
      ` : ''}
      
      ${results.errors.length > 0 ? `
      <h3>⚠️ Issues</h3>
      <ul>
        ${results.errors.map((error: string) => `<li style="color: #f56565;">${error}</li>`).join('')}
      </ul>
      ` : ''}
      
      <p>Visit your <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || '#'}/dashboard">dashboard</a> to view detailed results.</p>
    `;

    // Send email using the send-email-event function
    const { error: emailError } = await supabase.functions.invoke('send-email-event', {
      body: {
        to: user.email,
        subject: '🤖 AutoPilot SEO Summary - Actions Completed',
        html: emailContent,
        type: 'autopilot_summary'
      }
    });

    if (emailError) {
      console.error('Failed to send autopilot summary email:', emailError);
    } else {
      console.log(`📧 AutoPilot summary sent to ${user.email}`);
    }

  } catch (error) {
    console.error('Error in sendAutoPilotSummary:', error);
  }
}