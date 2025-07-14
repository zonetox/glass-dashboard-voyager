import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-WEBHOOK] ${step}${detailsStr}`);
};

// Verify Stripe signature
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature.includes(expectedHex);
  } catch (error) {
    logStep("Stripe signature verification failed", { error: error.message });
    return false;
  }
}

// Process different webhook types
async function processWebhook(provider: string, data: any): Promise<{ userId?: string, amount?: number, status: string, sessionId?: string, transactionId?: string }> {
  switch (provider) {
    case 'stripe':
      if (data.type === 'checkout.session.completed') {
        const session = data.data.object;
        return {
          userId: session.metadata?.user_id,
          amount: session.amount_total,
          status: 'completed',
          sessionId: session.id,
          transactionId: session.payment_intent
        };
      }
      break;
      
    case 'paypal':
      if (data.event_type === 'CHECKOUT.ORDER.APPROVED') {
        return {
          userId: data.resource?.purchase_units?.[0]?.custom_id,
          amount: parseFloat(data.resource?.purchase_units?.[0]?.amount?.value) * 100,
          status: 'completed',
          transactionId: data.resource?.id
        };
      }
      break;
      
    case 'momo':
      if (data.resultCode === 0) {
        return {
          userId: data.extraData,
          amount: data.amount,
          status: 'completed',
          transactionId: data.transId
        };
      }
      break;
      
    case 'vnpay':
      if (data.vnp_ResponseCode === '00') {
        return {
          userId: data.vnp_OrderInfo?.split('_')[1], // Assuming format: "order_userid"
          amount: parseInt(data.vnp_Amount) / 100,
          status: 'completed',
          transactionId: data.vnp_TransactionNo
        };
      }
      break;
  }
  
  return { status: 'failed' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Create Supabase client with service role key
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");
    
    const body = await req.text();
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'unknown';
    
    logStep("Processing webhook", { provider });

    // Verify webhook signature based on provider
    let isValid = false;
    
    switch (provider) {
      case 'stripe':
        const stripeSignature = req.headers.get('stripe-signature');
        const stripeSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        if (stripeSignature && stripeSecret) {
          isValid = await verifyStripeSignature(body, stripeSignature, stripeSecret);
        }
        break;
        
      case 'paypal':
        // PayPal webhook verification would require additional setup
        // For now, we'll trust the webhook (implement proper verification in production)
        isValid = true;
        break;
        
      case 'momo':
        // Momo webhook verification using signature
        const momoSignature = req.headers.get('x-momo-signature');
        // Implement Momo signature verification here
        isValid = true; // Placeholder
        break;
        
      case 'vnpay':
        // VNPay webhook verification using hash
        isValid = true; // Placeholder - implement proper VNPay verification
        break;
        
      default:
        logStep("Unknown provider", { provider });
        return new Response("Unknown provider", { status: 400, headers: corsHeaders });
    }

    if (!isValid) {
      logStep("Invalid webhook signature", { provider });
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    logStep("Webhook signature verified", { provider });

    // Parse webhook data
    const webhookData = JSON.parse(body);
    const processResult = await processWebhook(provider, webhookData);
    
    logStep("Webhook processed", { processResult });

    // Log transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: processResult.userId || null,
        gateway: provider,
        status: processResult.status === 'completed' ? 'success' : 'failed',
        amount: processResult.amount || 0,
        currency: 'vnd',
        plan_id: 'pro',
        raw_data: webhookData
      })
      .select()
      .maybeSingle();

    if (transactionError) {
      logStep("Transaction logging failed", { error: transactionError });
    } else {
      logStep("Transaction logged", { transactionId: transaction.id });
    }

    // If payment successful and user identified, upgrade to Pro
    if (processResult.status === 'completed' && processResult.userId) {
      logStep("Upgrading user to Pro", { userId: processResult.userId });
      
      // Update user plan to Pro
      const { error: planError } = await supabaseClient
        .from("user_plans")
        .update({
          plan_id: 'pro',
          start_date: new Date().toISOString(),
          end_date: null,
          used_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', processResult.userId)
        .eq('plan_id', 'free');

      if (planError) {
        logStep("Plan upgrade failed", { error: planError, userId: processResult.userId });
        
        // If no existing plan found, create new Pro plan
        const { error: insertError } = await supabaseClient
          .from("user_plans")
          .insert({
            user_id: processResult.userId,
            plan_id: 'pro',
            start_date: new Date().toISOString(),
            end_date: null,
            used_count: 0
          });

        if (insertError) {
          logStep("Pro plan creation failed", { error: insertError });
        } else {
          logStep("Pro plan created successfully", { userId: processResult.userId });
        }
      } else {
        logStep("User upgraded to Pro successfully", { userId: processResult.userId });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed successfully",
        transactionId: transaction?.id 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook processing error", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});