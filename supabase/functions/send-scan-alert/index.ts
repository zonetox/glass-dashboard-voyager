
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
    const { userId, websiteUrl, scoreChange, currentScore, previousScore, newIssues } = await req.json();

    // Get user email (you'll need to implement this based on your auth setup)
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    
    if (!user?.email) {
      throw new Error('User email not found');
    }

    const domain = new URL(websiteUrl).hostname;
    const optimizeUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/optimize-website`;

    const emailContent = `
      <h2>SEO Alert for ${domain}</h2>
      <p>Your website's SEO score has changed:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Previous Score:</strong> ${previousScore}</p>
        <p><strong>Current Score:</strong> ${currentScore}</p>
        <p><strong>Change:</strong> <span style="color: ${scoreChange >= 0 ? 'green' : 'red'};">
          ${scoreChange >= 0 ? '+' : ''}${scoreChange}
        </span></p>
      </div>

      ${newIssues.length > 0 ? `
        <h3>New Issues Found:</h3>
        <ul>
          ${newIssues.map((issue: any) => `<li>${issue.description || issue.title}</li>`).join('')}
        </ul>
      ` : ''}

      <div style="margin: 30px 0;">
        <a href="${optimizeUrl}?url=${encodeURIComponent(websiteUrl)}&userId=${userId}" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          🔧 Auto-optimize with 1 Click
        </a>
      </div>

      <p>You can also visit your dashboard to review detailed analysis and make manual optimizations.</p>
    `;

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, just log the alert
    console.log(`Email alert for ${user.email}:`, emailContent);

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending scan alert:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
