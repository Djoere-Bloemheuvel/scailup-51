
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company_name?: string;
  phone?: string;
}

const isBusinessEmail = (email: string): boolean => {
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'live.com', 'msn.com', 'aol.com', 'icloud.com', 'me.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !personalDomains.includes(domain) : false;
}

const sendWebhookWithTimeout = async (url: string, payload: any, apiKey: string, timeoutMs: number = 15000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`🚀 Sending webhook to: ${url}`);
    console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    console.log(`📨 Response from ${url}: ${response.status} - ${responseText}`);
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ Webhook request failed for ${url}:`, error);
    throw error;
  }
}

serve(async (req) => {
  console.log('🚀 Register webhook function called!');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚡ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('N8N_REGISTER_WEBHOOK_KEY');
    if (!apiKey) {
      console.error('❌ N8N_REGISTER_WEBHOOK_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Webhook API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ API key found, processing request...');
    
    const requestBody = await req.text();
    console.log('📥 Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 Parsed request body:', JSON.stringify(parsedBody, null, 2));

    const { record } = parsedBody;
    
    if (!record || !record.id || !record.email) {
      console.error('❌ Invalid user record received:', record);
      return new Response(
        JSON.stringify({ error: 'Invalid user record' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userEmail = record.email;
    console.log('👤 Processing user:', userEmail);
    
    // Only send webhook for business emails
    if (!isBusinessEmail(userEmail)) {
      console.log(`⏭️ Skipping webhook for personal email: ${userEmail}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook skipped for personal email',
          email: userEmail 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract user data
    const userData: UserData = {
      id: record.id,
      email: userEmail,
      firstName: record.raw_user_meta_data?.firstName || record.raw_user_meta_data?.first_name,
      lastName: record.raw_user_meta_data?.lastName || record.raw_user_meta_data?.last_name,
      company_name: record.raw_user_meta_data?.company_name,
      phone: record.raw_user_meta_data?.phone,
    };

    console.log(`📧 Sending webhook for business email: ${userEmail}`);
    console.log(`📤 User data payload:`, JSON.stringify(userData, null, 2));

    // Determine environment based on hostname or environment variable
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production' || 
                        Deno.env.get('SUPABASE_URL')?.includes('zkrfnyokxhsgetslfodg');
    
    // Define both URLs
    const testUrl = 'https://djoere.app.n8n.cloud/webhook-test/ad791861-757c-43ab-ab02-3e412a7d66f6';
    const productionUrl = 'https://djoere.app.n8n.cloud/webhook/ad791861-757c-43ab-ab02-3e412a7d66f6';
    
    console.log(`🎯 Environment detected: ${isProduction ? 'PRODUCTION' : 'TEST'}`);
    console.log(`🔑 Using API key: ${apiKey ? 'Present' : 'Missing'}`);
    
    // Send to both URLs for now to ensure reliability
    const results = [];
    
    // Send to test URL
    try {
      console.log('📤 Sending to TEST webhook...');
      const testResponse = await sendWebhookWithTimeout(testUrl, userData, apiKey, 15000);
      results.push({
        url: testUrl,
        success: testResponse.ok,
        status: testResponse.status,
        type: 'test'
      });
      console.log(`✅ Test webhook sent successfully: ${testResponse.status}`);
    } catch (testError) {
      console.error(`❌ Test webhook failed:`, testError);
      results.push({
        url: testUrl,
        success: false,
        error: testError.message,
        type: 'test'
      });
    }
    
    // Send to production URL
    try {
      console.log('📤 Sending to PRODUCTION webhook...');
      const productionResponse = await sendWebhookWithTimeout(productionUrl, userData, apiKey, 15000);
      results.push({
        url: productionUrl,
        success: productionResponse.ok,
        status: productionResponse.status,
        type: 'production'
      });
      console.log(`✅ Production webhook sent successfully: ${productionResponse.status}`);
    } catch (productionError) {
      console.error(`❌ Production webhook failed:`, productionError);
      results.push({
        url: productionUrl,
        success: false,
        error: productionError.message,
        type: 'production'
      });
    }

    // Determine overall success
    const anySuccess = results.some(r => r.success);
    const allSuccess = results.every(r => r.success);
    
    console.log(`📊 Webhook results:`, results);
    
    if (anySuccess) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Webhook sent to ${allSuccess ? 'both' : 'some'} endpoints`,
          email: userEmail,
          results: results,
          environment: isProduction ? 'production' : 'test'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'All webhook requests failed',
          email: userEmail,
          results: results,
          environment: isProduction ? 'production' : 'test'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Error in register-webhook function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
