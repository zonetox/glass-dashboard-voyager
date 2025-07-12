import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  url: string;
  type: 'meta' | 'schema' | 'content' | 'html';
  original_data: any;
  ai_suggested_data: any;
  user_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client with service role key for database writes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const body: BackupRequest = await req.json();
    
    // Validate required fields
    if (!body.url || !body.type || !body.original_data || !body.ai_suggested_data) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: url, type, original_data, ai_suggested_data' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate type field
    const validTypes = ['meta', 'schema', 'content', 'html'];
    if (!validTypes.includes(body.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user_id from authorization header if not provided in body
    let userId = body.user_id;
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (!userError && user) {
          userId = user.id;
        }
      }
    }

    // If still no user_id, return error (required for RLS)
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          error: 'user_id is required either in request body or authorization header' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating backup for user ${userId}, URL: ${body.url}, type: ${body.type}`);

    // Insert backup record
    const { data, error } = await supabase
      .from('backups')
      .insert({
        user_id: userId,
        url: body.url,
        type: body.type,
        original_data: body.original_data,
        ai_suggested_data: body.ai_suggested_data
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create backup',
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Backup created successfully with ID: ${data.id}`);

    return new Response(
      JSON.stringify({ 
        backup_id: data.id,
        message: 'Backup created successfully'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});