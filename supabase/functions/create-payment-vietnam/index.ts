import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash, createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  payment_method: 'momo' | 'vnpay' | 'paypal';
  package_id: string;
  amount: number;
  package_name: string;
  return_url: string;
  cancel_url: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VIETNAM-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody: PaymentRequest = await req.json();
    const { payment_method, package_id, amount, package_name, return_url, cancel_url } = requestBody;

    logStep("Payment request received", { payment_method, package_id, amount });

    // Create order record
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error: orderError } = await supabaseClient
      .from('payment_orders')
      .insert({
        id: orderId,
        user_id: user.id,
        package_id,
        amount,
        payment_method,
        status: 'pending',
        user_email: user.email
      });

    if (orderError) throw orderError;
    logStep("Order created", { orderId });

    let paymentUrl = '';

    switch (payment_method) {
      case 'momo':
        paymentUrl = await createMoMoPayment(orderId, amount, package_name, return_url);
        break;
      case 'vnpay':
        paymentUrl = await createVNPayPayment(orderId, amount, package_name, return_url);
        break;
      case 'paypal':
        paymentUrl = await createPayPalPayment(orderId, amount, package_name, return_url, cancel_url);
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    logStep("Payment URL created", { paymentUrl });

    return new Response(JSON.stringify({ 
      payment_url: paymentUrl,
      order_id: orderId 
    }), {
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

async function createMoMoPayment(orderId: string, amount: number, orderInfo: string, returnUrl: string): Promise<string> {
  const partnerCode = Deno.env.get("MOMO_PARTNER_CODE") || "";
  const accessKey = Deno.env.get("MOMO_ACCESS_KEY") || "";
  const secretKey = Deno.env.get("MOMO_SECRET_KEY") || "";
  const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
  
  const requestId = `${orderId}_${Date.now()}`;
  const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook-vietnam`;
  const extraData = "";
  const requestType = "payWithATM";
  
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  
  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount: amount.toString(),
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl: notifyUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();
  
  if (result.resultCode === 0) {
    return result.payUrl;
  } else {
    throw new Error(`MoMo Error: ${result.message}`);
  }
}

async function createVNPayPayment(orderId: string, amount: number, orderInfo: string, returnUrl: string): Promise<string> {
  const vnpUrl = Deno.env.get("VNPAY_URL") || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const tmnCode = Deno.env.get("VNPAY_TMN_CODE") || "";
  const secretKey = Deno.env.get("VNPAY_HASH_SECRET") || "";
  
  const createDate = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const expireDate = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace(/[-:T]/g, '').slice(0, 14);
  
  const vnpParams: Record<string, string> = {
    'vnp_Version': '2.1.0',
    'vnp_Command': 'pay',
    'vnp_TmnCode': tmnCode,
    'vnp_Amount': (amount * 100).toString(),
    'vnp_CreateDate': createDate,
    'vnp_CurrCode': 'VND',
    'vnp_IpAddr': '127.0.0.1',
    'vnp_Locale': 'vn',
    'vnp_OrderInfo': orderInfo,
    'vnp_OrderType': 'other',
    'vnp_ReturnUrl': returnUrl,
    'vnp_TxnRef': orderId,
    'vnp_ExpireDate': expireDate
  };

  const sortedKeys = Object.keys(vnpParams).sort();
  const signData = sortedKeys.map(key => `${key}=${vnpParams[key]}`).join('&');
  const secureHash = createHmac('sha512', secretKey).update(signData).digest('hex');
  
  vnpParams['vnp_SecureHash'] = secureHash;
  
  const queryString = Object.keys(vnpParams)
    .map(key => `${key}=${encodeURIComponent(vnpParams[key])}`)
    .join('&');
    
  return `${vnpUrl}?${queryString}`;
}

async function createPayPalPayment(orderId: string, amount: number, description: string, returnUrl: string, cancelUrl: string): Promise<string> {
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
  
  // Create payment
  const amountUSD = (amount / 24000).toFixed(2); // Convert VND to USD (approximate rate)
  
  const payment = {
    intent: 'sale',
    payer: { payment_method: 'paypal' },
    transactions: [{
      amount: {
        total: amountUSD,
        currency: 'USD'
      },
      description,
      custom: orderId
    }],
    redirect_urls: {
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  };
  
  const paymentResponse = await fetch(`${baseUrl}/v1/payments/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
  });
  
  const paymentData = await paymentResponse.json();
  
  if (paymentData.state === 'created') {
    const approvalUrl = paymentData.links.find((link: any) => link.rel === 'approval_url');
    return approvalUrl.href;
  } else {
    throw new Error(`PayPal Error: ${paymentData.message}`);
  }
}