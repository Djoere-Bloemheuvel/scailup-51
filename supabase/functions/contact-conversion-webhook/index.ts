
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event_type: string
  timestamp: string
  client_id: string
  user_id: string
  lead_id?: string
  contact_id?: string
  contact_data?: {
    first_name?: string
    last_name?: string
    email?: string
    company_name?: string
    title?: string
    industry?: string
    country?: string
    linkedin_url?: string
    company_website?: string
  }
  bulk_conversion?: boolean
  conversions?: Array<{
    lead_id: string
    contact_id: string
    contact_data: any
  }>
  total_count?: number
}

// Send webhook to multiple URLs with proper error handling
async function sendWebhookToUrl(url: string, payload: WebhookPayload, apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📤 Sending webhook to: ${url}`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log(`📡 Response from ${url}:`, response.status, responseText);

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }
  } catch (error) {
    console.error(`❌ Error sending webhook to ${url}:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('🔄 Webhook request received:', requestBody);

    const { bulk_conversion, conversions, client_id, user_id, total_count } = requestBody

    // Webhook URLs and API key
    const productionUrl = 'https://djoere.app.n8n.cloud/webhook/000b7e1d-5e42-44df-b2ec-5d17038e6c6c'
    const testUrl = 'https://djoere.app.n8n.cloud/webhook-test/000b7e1d-5e42-44df-b2ec-5d17038e6c6c'
    const apiKey = 'sk_live_29d1f0c8a7b94efbb2ed_scailup'

    const timestamp = new Date().toISOString()

    // Handle bulk conversion
    if (bulk_conversion && conversions && conversions.length > 0) {
      console.log('📊 Processing bulk conversion with', conversions.length, 'contacts');

      const webhookPayload: WebhookPayload = {
        event_type: 'bulk_contacts_created',
        timestamp,
        client_id,
        user_id,
        bulk_conversion: true,
        conversions: conversions.map(conversion => ({
          lead_id: conversion.lead_id,
          contact_id: conversion.contact_id,
          contact_data: {
            first_name: conversion.contact_data?.first_name,
            last_name: conversion.contact_data?.last_name,
            email: conversion.contact_data?.email,
            company_name: conversion.contact_data?.company_name,
            title: conversion.contact_data?.title,
            industry: conversion.contact_data?.industry,
            country: conversion.contact_data?.country,
            linkedin_url: conversion.contact_data?.linkedin_url,
            company_website: conversion.contact_data?.company_website
          }
        })),
        total_count: total_count || conversions.length
      }

      // Send to both URLs
      const productionResult = await sendWebhookToUrl(productionUrl, webhookPayload, apiKey);
      const testResult = await sendWebhookToUrl(testUrl, webhookPayload, apiKey);

      console.log('📊 Bulk webhook results:', {
        production: productionResult,
        test: testResult
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Bulk webhook sent',
          results: {
            production: productionResult,
            test: testResult
          },
          total_contacts: conversions.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle single conversion
    const { lead_id, contact_id } = requestBody

    if (!lead_id || !contact_id || !client_id || !user_id) {
      console.error('❌ Missing required parameters:', { lead_id, contact_id, client_id, user_id });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👤 Processing single conversion for contact:', contact_id);

    // Get contact data for the webhook payload
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contact_id)
      .single()

    if (contactError) {
      console.error('❌ Error fetching contact data:', contactError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch contact data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare single webhook payload
    const webhookPayload: WebhookPayload = {
      event_type: 'contact_created',
      timestamp,
      client_id,
      user_id,
      lead_id,
      contact_id,
      contact_data: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        company_name: contact.company_name,
        title: contact.title,
        industry: contact.industry,
        country: contact.country,
        linkedin_url: contact.linkedin_url,
        company_website: contact.company_website
      }
    }

    // Send to both URLs
    const productionResult = await sendWebhookToUrl(productionUrl, webhookPayload, apiKey);
    const testResult = await sendWebhookToUrl(testUrl, webhookPayload, apiKey);

    console.log('👤 Single webhook results:', {
      production: productionResult,
      test: testResult
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Single webhook sent',
        results: {
          production: productionResult,
          test: testResult
        },
        contact_id,
        lead_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Unexpected error in webhook function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
