import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { backup_id, user_id } = await req.json();

    // Validate required fields
    if (!backup_id) {
      return new Response(
        JSON.stringify({ error: 'backup_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Restoring backup:', { backup_id, user_id });

    // Find the backup and verify user ownership
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backup_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError) {
      console.error('Error fetching backup:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Backup not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found or you do not have permission to restore it' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Backup found:', { 
      backup_id: backup.id, 
      type: backup.type, 
      url: backup.url 
    });

    // Prepare restoration data
    const restorationData = {
      backup_id: backup.id,
      url: backup.url,
      type: backup.type,
      original_data: backup.original_data,
      ai_suggested_data: backup.ai_suggested_data,
      created_at: backup.created_at,
      restored_at: new Date().toISOString()
    };

    // For different backup types, provide different restoration methods
    let restorationMethod = 'manual_copy';
    let instructions = '';

    switch (backup.type) {
      case 'meta':
        restorationMethod = 'meta_tags';
        instructions = 'Restore meta tags to the website head section. You can copy the original meta tags and manually update your website.';
        break;
      
      case 'schema':
        restorationMethod = 'schema_markup';
        instructions = 'Restore structured data/schema markup. Copy the original schema data and add it back to your website.';
        break;
      
      case 'html':
        restorationMethod = 'html_content';
        instructions = 'Restore HTML content. This requires manual copying and pasting of the original HTML content to your website.';
        break;
      
      case 'content':
        restorationMethod = 'content_data';
        instructions = 'Restore content data. You will need to manually update your website content with the original data.';
        break;
      
      default:
        instructions = 'Manual restoration required. Copy the original data and apply it to your website manually.';
    }

    // Log the restoration attempt
    console.log('Restoration completed:', {
      backup_id,
      user_id,
      type: backup.type,
      method: restorationMethod,
      url: backup.url
    });

    // Create a comparison of what was changed
    const changes_analysis = {
      backup_type: backup.type,
      original_size: JSON.stringify(backup.original_data).length,
      ai_suggested_size: JSON.stringify(backup.ai_suggested_data).length,
      restoration_method: restorationMethod,
      requires_manual_action: true
    };

    const response = {
      success: true,
      message: 'Backup restoration data retrieved successfully',
      data: restorationData,
      restoration: {
        method: restorationMethod,
        instructions: instructions,
        manual_action_required: true
      },
      changes_analysis,
      // Provide both datasets for comparison
      comparison: {
        original_data: backup.original_data,
        ai_suggested_data: backup.ai_suggested_data,
        differences_detected: JSON.stringify(backup.original_data) !== JSON.stringify(backup.ai_suggested_data)
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in restore-site function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})