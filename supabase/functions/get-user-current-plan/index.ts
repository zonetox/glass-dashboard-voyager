import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Get user's current plan
    const { data: planData, error: planError } = await supabaseClient
      .rpc('get_user_current_plan', { _user_id: user_id })

    if (planError) {
      console.error('Error getting user plan:', planError)
      throw planError
    }

    // If no plan found or empty result, assign free plan
    if (!planData || planData.length === 0) {
      // Create free plan entry for user
      const { error: insertError } = await supabaseClient
        .from('user_plans')
        .insert({
          user_id: user_id,
          plan_id: 'free',
          start_date: new Date().toISOString(),
          end_date: null,
          used_count: 0
        })

      if (insertError) {
        console.error('Error creating free plan:', insertError)
      }

      return new Response(
        JSON.stringify({
          plan_id: 'free',
          plan_name: 'Free Plan',
          monthly_limit: 10,
          pdf_enabled: false,
          ai_enabled: true,
          used_count: 0,
          remaining_count: 10
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return the first (current) plan
    const currentPlan = Array.isArray(planData) ? planData[0] : planData

    return new Response(
      JSON.stringify(currentPlan),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-user-current-plan function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        plan_id: 'free',
        plan_name: 'Free Plan', 
        monthly_limit: 10,
        pdf_enabled: false,
        ai_enabled: true,
        used_count: 0,
        remaining_count: 10
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})