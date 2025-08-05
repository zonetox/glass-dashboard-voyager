import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`Promoting user with email: ${email} to admin`);

    // Get user by email from auth.users
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      throw new Error(`Failed to get users: ${getUserError.message}`);
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Found user: ${user.id}`);

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Profile error: ${profileError.message}`);
    }

    // Create profile if it doesn't exist
    if (!profile) {
      const { error: createProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user.id,
          tier: 'enterprise',
          scans_limit: 1000,
          ai_rewrites_limit: 100,
          optimizations_limit: 200,
          email_verified: true
        });

      if (createProfileError) {
        throw new Error(`Failed to create profile: ${createProfileError.message}`);
      }
    } else {
      // Update existing profile
      const { error: updateProfileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          tier: 'enterprise',
          scans_limit: 1000,
          ai_rewrites_limit: 100,
          optimizations_limit: 200,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateProfileError) {
        throw new Error(`Failed to update profile: ${updateProfileError.message}`);
      }
    }

    // Remove any existing roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      });

    if (roleError) {
      throw new Error(`Failed to add admin role: ${roleError.message}`);
    }

    // Create enterprise plan
    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .upsert({
        user_id: user.id,
        plan_id: 'enterprise',
        start_date: new Date().toISOString(),
        end_date: null,
        used_count: 0
      });

    if (planError) {
      throw new Error(`Failed to create plan: ${planError.message}`);
    }

    // Create usage record
    const { error: usageError } = await supabaseAdmin
      .from('user_usage')
      .upsert({
        user_id: user.id,
        scans_used: 0,
        ai_rewrites_used: 0,
        optimizations_used: 0,
        reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      });

    if (usageError) {
      throw new Error(`Failed to create usage: ${usageError.message}`);
    }

    // Log the promotion activity
    await supabaseAdmin
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'promoted_to_admin',
        details: {
          promoted_by: 'system',
          email: email,
          timestamp: new Date().toISOString()
        }
      });

    console.log(`Successfully promoted ${email} to admin`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${email} has been promoted to admin`,
        user_id: user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error promoting user to admin:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});