import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const contentType = req.headers.get("content-type");
    let webhookData: any;

    if (contentType?.includes("application/json")) {
      webhookData = await req.json();
    } else {
      const formData = await req.formData();
      webhookData = Object.fromEntries(formData.entries());
    }

    logStep("Webhook data received", webhookData);

    const paymentMethod = detectPaymentMethod(webhookData);
    logStep("Payment method detected", { paymentMethod });

    let orderId: string;
    let success: boolean;
    let transactionId: string;

    switch (paymentMethod) {
      case 'momo':
        ({ orderId, success, transactionId } = await processMoMoWebhook(webhookData));
        break;
      case 'vnpay':
        ({ orderId, success, transactionId } = await processVNPayWebhook(webhookData));
        break;
      case 'paypal':
        ({ orderId, success, transactionId } = await processPayPalWebhook(webhookData));
        break;
      default:
        throw new Error('Unknown payment method');
    }

    logStep("Payment processed", { orderId, success, transactionId });

    if (success) {
      // Update order status
      const { error: updateError } = await supabaseClient
        .from('payment_orders')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Get order details to activate subscription
      const { data: order, error: orderError } = await supabaseClient
        .from('payment_orders')
        .select('user_id, package_id')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Activate subscription
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: order.user_id,
          package_id: order.package_id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (subscriptionError) throw subscriptionError;

      logStep("Subscription activated", { userId: order.user_id, packageId: order.package_id });

      // Send confirmation email
      try {
        await supabaseClient.functions.invoke('send-email-event', {
          body: {
            to: order.user_id,
            template: 'payment_success',
            data: {
              order_id: orderId,
              transaction_id: transactionId,
              package_id: order.package_id
            }
          }
        });
      } catch (emailError) {
        logStep("Email send failed", emailError);
      }
    } else {
      // Update order as failed
      await supabaseClient
        .from('payment_orders')
        .update({
          status: 'failed',
          transaction_id: transactionId
        })
        .eq('id', orderId);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function detectPaymentMethod(data: any): string {
  if (data.partnerCode || data.resultCode !== undefined) {
    return 'momo';
  } else if (data.vnp_TmnCode || data.vnp_ResponseCode !== undefined) {
    return 'vnpay';
  } else if (data.payer_id || data.payment_id) {
    return 'paypal';
  }
  throw new Error('Cannot detect payment method');
}

async function processMoMoWebhook(data: any) {
  const secretKey = Deno.env.get("MOMO_SECRET_KEY") || "";
  
  // Verify signature
  const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
  
  const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  
  if (signature !== data.signature) {
    throw new Error('Invalid MoMo signature');
  }
  
  return {
    orderId: data.orderId,
    success: data.resultCode === 0,
    transactionId: data.transId || data.requestId
  };
}

async function processVNPayWebhook(data: any) {
  const secretKey = Deno.env.get("VNPAY_HASH_SECRET") || "";
  
  // Verify signature
  const secureHash = data.vnp_SecureHash;
  delete data.vnp_SecureHash;
  
  const sortedKeys = Object.keys(data).sort();
  const signData = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  const computedHash = createHmac('sha512', secretKey).update(signData).digest('hex');
  
  if (computedHash !== secureHash) {
    throw new Error('Invalid VNPay signature');
  }
  
  return {
    orderId: data.vnp_TxnRef,
    success: data.vnp_ResponseCode === '00',
    transactionId: data.vnp_TransactionNo || data.vnp_TxnRef
  };
}

async function processPayPalWebhook(data: any) {
  // For PayPal, we'll need to verify the payment with PayPal API
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
  const baseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";
  
  // Get access token
  const auth = btoa(`${clientId}:${clientSecret}`);
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  
  // Verify payment
  const paymentId = data.paymentId || data.payment_id;
  const paymentResponse = await fetch(`${baseUrl}/v1/payments/payment/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const paymentData = await paymentResponse.json();
  
  return {
    orderId: paymentData.transactions[0].custom,
    success: paymentData.state === 'approved',
    transactionId: paymentId
  };
}