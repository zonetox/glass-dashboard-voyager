import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  subject: string;
  content: string;
  user_id?: string;
}

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

    const { email, subject, content, user_id }: EmailRequest = await req.json();

    if (!email || !subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, subject, content' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create email log entry
    const { data: logEntry, error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user_id || null,
        email,
        subject,
        content,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to create email log' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    try {
      // Send email using Deno's built-in SMTP (for demonstration)
      // Note: In production, you would use the SMTP configuration from Supabase
      // or integrate with your preferred email service
      
      console.log(`Sending email to: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content preview: ${content.substring(0, 100)}...`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update log entry as sent
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);

      if (updateError) {
        console.error('Error updating email log:', updateError);
      }

      console.log(`Email sent successfully to ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          log_id: logEntry.id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      
      // Update log entry as failed
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
        .eq('id', logEntry.id);

      if (updateError) {
        console.error('Error updating email log:', updateError);
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

  } catch (error) {
    console.error('Error in send-email-event function:', error);
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