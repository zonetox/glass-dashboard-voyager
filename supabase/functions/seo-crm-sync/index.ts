import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      domain, 
      tracking_data,
      crm_config_id,
      user_id 
    } = await req.json();

    if (!action || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Action and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`SEO-CRM sync action: ${action} for user: ${user_id}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'track_visit':
        return await handleTrackVisit(supabase, tracking_data, user_id);
      
      case 'sync_to_crm':
        return await handleSyncToCRM(supabase, crm_config_id, tracking_data, user_id);
      
      case 'test_crm_connection':
        return await handleTestConnection(supabase, crm_config_id, user_id);
      
      case 'bulk_sync':
        return await handleBulkSync(supabase, crm_config_id, user_id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in seo-crm-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleTrackVisit(supabase: any, trackingData: any, userId: string) {
  try {
    // Insert tracking data
    const { data: tracking, error: trackingError } = await supabase
      .from('seo_tracking_data')
      .insert({
        user_id: userId,
        domain: trackingData.domain,
        page_url: trackingData.page_url,
        visitor_id: trackingData.visitor_id,
        session_id: trackingData.session_id,
        keyword: trackingData.keyword,
        campaign_id: trackingData.campaign_id,
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_term: trackingData.utm_term,
        utm_content: trackingData.utm_content,
        referrer: trackingData.referrer,
        user_agent: trackingData.user_agent,
        ip_address: trackingData.ip_address,
        country: trackingData.country,
        city: trackingData.city,
        device_type: trackingData.device_type,
        browser: trackingData.browser,
        visit_duration: trackingData.visit_duration,
        visited_at: trackingData.visited_at || new Date().toISOString()
      })
      .select()
      .single();

    if (trackingError) throw trackingError;

    // Check for active CRM configurations and auto-sync if enabled
    const { data: crmConfigs, error: configError } = await supabase
      .from('crm_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (configError) throw configError;

    // Auto-sync to all active CRMs
    const syncPromises = crmConfigs.map(config => 
      syncDataToCRM(supabase, config, tracking, userId)
    );
    
    await Promise.allSettled(syncPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tracking_id: tracking.id,
        synced_to_crms: crmConfigs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking visit:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to track visit' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSyncToCRM(supabase: any, crmConfigId: string, trackingData: any, userId: string) {
  try {
    // Get CRM configuration
    const { data: crmConfig, error: configError } = await supabase
      .from('crm_configurations')
      .select('*')
      .eq('id', crmConfigId)
      .eq('user_id', userId)
      .single();

    if (configError || !crmConfig) {
      throw new Error('CRM configuration not found');
    }

    // Get tracking data if not provided
    let tracking = trackingData;
    if (!tracking && trackingData.tracking_id) {
      const { data: trackingResult, error: trackingError } = await supabase
        .from('seo_tracking_data')
        .select('*')
        .eq('id', trackingData.tracking_id)
        .eq('user_id', userId)
        .single();

      if (trackingError) throw trackingError;
      tracking = trackingResult;
    }

    const result = await syncDataToCRM(supabase, crmConfig, tracking, userId);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing to CRM:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to sync to CRM' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleTestConnection(supabase: any, crmConfigId: string, userId: string) {
  try {
    const { data: crmConfig, error: configError } = await supabase
      .from('crm_configurations')
      .select('*')
      .eq('id', crmConfigId)
      .eq('user_id', userId)
      .single();

    if (configError || !crmConfig) {
      throw new Error('CRM configuration not found');
    }

    const testResult = await testCRMConnection(crmConfig);

    return new Response(
      JSON.stringify({ success: true, ...testResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing CRM connection:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to test CRM connection' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleBulkSync(supabase: any, crmConfigId: string, userId: string) {
  try {
    // Get unsynced tracking data
    const { data: unsyncedData, error: dataError } = await supabase
      .from('seo_tracking_data')
      .select('*')
      .eq('user_id', userId)
      .eq('synced_to_crm', false)
      .order('created_at', { ascending: true })
      .limit(100); // Process in batches

    if (dataError) throw dataError;

    const { data: crmConfig, error: configError } = await supabase
      .from('crm_configurations')
      .select('*')
      .eq('id', crmConfigId)
      .eq('user_id', userId)
      .single();

    if (configError || !crmConfig) {
      throw new Error('CRM configuration not found');
    }

    const syncResults = [];
    for (const tracking of unsyncedData) {
      try {
        const result = await syncDataToCRM(supabase, crmConfig, tracking, userId);
        syncResults.push({ tracking_id: tracking.id, success: true });
      } catch (error) {
        console.error(`Failed to sync tracking ${tracking.id}:`, error);
        syncResults.push({ tracking_id: tracking.id, success: false, error: error.message });
      }
    }

    const successCount = syncResults.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: unsyncedData.length,
        synced: successCount,
        failed: unsyncedData.length - successCount,
        results: syncResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk sync:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to bulk sync' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function syncDataToCRM(supabase: any, crmConfig: any, trackingData: any, userId: string) {
  const startTime = Date.now();
  let syncLog = {
    user_id: userId,
    crm_config_id: crmConfig.id,
    tracking_data_id: trackingData.id,
    sync_type: 'contact',
    status: 'pending',
    request_data: {},
    response_data: {},
    error_message: null,
    sync_duration_ms: 0
  };

  try {
    switch (crmConfig.crm_type) {
      case 'hubspot':
        return await syncToHubSpot(supabase, crmConfig, trackingData, syncLog);
      
      case 'salesforce':
        return await syncToSalesforce(supabase, crmConfig, trackingData, syncLog);
      
      case 'zoho':
        return await syncToZoho(supabase, crmConfig, trackingData, syncLog);
      
      default:
        throw new Error(`Unsupported CRM type: ${crmConfig.crm_type}`);
    }
  } catch (error) {
    syncLog.status = 'failed';
    syncLog.error_message = error.message;
    throw error;
  } finally {
    syncLog.sync_duration_ms = Date.now() - startTime;
    
    // Log the sync attempt
    await supabase
      .from('crm_sync_logs')
      .insert(syncLog);
  }
}

async function syncToHubSpot(supabase: any, crmConfig: any, trackingData: any, syncLog: any) {
  const apiKey = crmConfig.api_key_encrypted; // In production, decrypt this
  const hubspotAPI = 'https://api.hubapi.com';

  // Prepare contact data
  const contactData = {
    properties: {
      email: trackingData.visitor_id + '@seotracking.com', // Mock email for anonymous visitors
      firstname: 'SEO',
      lastname: 'Visitor',
      website: trackingData.domain,
      hs_lead_status: 'SEO_LEAD',
      utm_source: trackingData.utm_source,
      utm_medium: trackingData.utm_medium,
      utm_campaign: trackingData.utm_campaign,
      utm_term: trackingData.utm_term,
      utm_content: trackingData.utm_content,
      seo_keyword: trackingData.keyword,
      seo_landing_page: trackingData.page_url,
      seo_referrer: trackingData.referrer,
      seo_country: trackingData.country,
      seo_device: trackingData.device_type
    }
  };

  syncLog.request_data = contactData;

  // Create/update contact
  const response = await fetch(`${hubspotAPI}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });

  const responseData = await response.json();
  syncLog.response_data = responseData;

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${responseData.message || 'Unknown error'}`);
  }

  // Update tracking data with CRM info
  await supabase
    .from('seo_tracking_data')
    .update({
      crm_contact_id: responseData.id,
      synced_to_crm: true
    })
    .eq('id', trackingData.id);

  syncLog.status = 'success';
  syncLog.crm_object_id = responseData.id;

  return { crm_contact_id: responseData.id, crm_type: 'hubspot' };
}

async function syncToSalesforce(supabase: any, crmConfig: any, trackingData: any, syncLog: any) {
  // Implement Salesforce sync
  throw new Error('Salesforce integration not yet implemented');
}

async function syncToZoho(supabase: any, crmConfig: any, trackingData: any, syncLog: any) {
  // Implement Zoho sync
  throw new Error('Zoho integration not yet implemented');
}

async function testCRMConnection(crmConfig: any) {
  switch (crmConfig.crm_type) {
    case 'hubspot':
      return await testHubSpotConnection(crmConfig);
    
    case 'salesforce':
      return await testSalesforceConnection(crmConfig);
    
    case 'zoho':
      return await testZohoConnection(crmConfig);
    
    default:
      throw new Error(`Unsupported CRM type: ${crmConfig.crm_type}`);
  }
}

async function testHubSpotConnection(crmConfig: any) {
  const apiKey = crmConfig.api_key_encrypted; // In production, decrypt this
  
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HubSpot connection failed: ${error.message || 'Invalid API key'}`);
  }

  return { 
    connected: true, 
    crm_type: 'hubspot',
    message: 'HubSpot connection successful'
  };
}

async function testSalesforceConnection(crmConfig: any) {
  throw new Error('Salesforce connection test not yet implemented');
}

async function testZohoConnection(crmConfig: any) {
  throw new Error('Zoho connection test not yet implemented');
}