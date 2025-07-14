import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Get emails that are ready to be sent (send_at <= now and status = 'queued')
    const { data: emailsToSend, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('send_at', new Date().toISOString())
      .order('send_at', { ascending: true })
      .limit(50); // Process max 50 emails per run

    if (fetchError) {
      console.error('Error fetching emails from queue:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch emails from queue' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!emailsToSend || emailsToSend.length === 0) {
      console.log('No emails to process');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No emails to process',
          processed: 0 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log(`Processing ${emailsToSend.length} emails from queue`);

    let sentCount = 0;
    let failedCount = 0;

    // Process each email
    for (const emailItem of emailsToSend) {
      try {
        console.log(`Sending email ${emailItem.id} to ${emailItem.email}`);

        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: 'SEO AI <noreply@your-domain.com>', // Replace with your verified domain
          to: [emailItem.email],
          subject: emailItem.subject,
          html: emailItem.body,
        });

        console.log(`Email sent successfully:`, emailResponse);

        // Update email status to 'sent'
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', emailItem.id);

        if (updateError) {
          console.error(`Error updating email ${emailItem.id} status:`, updateError);
        }

        // Log to email_logs table
        await supabase
          .from('email_logs')
          .insert({
            user_id: emailItem.user_id,
            email: emailItem.email,
            subject: emailItem.subject,
            content: emailItem.body,
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        sentCount++;

      } catch (emailError) {
        console.error(`Error sending email ${emailItem.id}:`, emailError);

        // Update email status to 'failed'
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          })
          .eq('id', emailItem.id);

        if (updateError) {
          console.error(`Error updating failed email ${emailItem.id} status:`, updateError);
        }

        // Log to email_logs table
        await supabase
          .from('email_logs')
          .insert({
            user_id: emailItem.user_id,
            email: emailItem.email,
            subject: emailItem.subject,
            content: emailItem.body,
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          });

        failedCount++;
      }

      // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Email processing completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email processing completed',
        processed: emailsToSend.length,
        sent: sentCount,
        failed: failedCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in process-email-queue function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);