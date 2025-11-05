import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-USER-ROLE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    logStep("Request from user", { userId: user.id });

    // Verify caller is admin (server-side check)
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (roleError || !isAdmin) {
      logStep("Unauthorized attempt", { userId: user.id });
      throw new Error('Only admins can update user roles');
    }

    // Parse request body
    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !newRole) {
      throw new Error('Missing targetUserId or newRole');
    }

    if (!['admin', 'member'].includes(newRole)) {
      throw new Error('Invalid role. Must be admin or member');
    }

    logStep("Updating role", { targetUserId, newRole, actorId: user.id });

    // Prevent self-demotion if user is the last admin
    if (newRole === 'member' && targetUserId === user.id) {
      const { data: adminCount, error: countError } = await supabaseClient
        .from('user_roles')
        .select('user_id', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (countError) throw countError;

      if ((adminCount as any)?.count <= 1) {
        throw new Error('Cannot demote the last admin');
      }
    }

    // Check if target user exists
    const { data: existingRole, error: checkError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingRole) {
      throw new Error('Target user not found');
    }

    // Update user role
    const { error: updateError } = await supabaseClient
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', targetUserId);

    if (updateError) throw updateError;

    // Log the change in user_activity_logs
    await supabaseClient.rpc('log_user_activity', {
      _user_id: user.id,
      _action: 'role_update',
      _details: {
        target_user_id: targetUserId,
        old_role: existingRole.role,
        new_role: newRole,
        timestamp: new Date().toISOString()
      }
    });

    logStep("Role updated successfully", { 
      targetUserId, 
      oldRole: existingRole.role, 
      newRole,
      actorId: user.id 
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User role updated from ${existingRole.role} to ${newRole}`,
        oldRole: existingRole.role,
        newRole
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Unauthorized') || error.message.includes('admin') ? 403 : 400
      }
    );
  }
});
