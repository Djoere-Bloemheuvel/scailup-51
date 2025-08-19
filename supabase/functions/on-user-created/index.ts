
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Import the webhook trigger function
const triggerRegisterWebhook = async (payload: any) => {
  try {
    console.log('🎯 Triggering register webhook for user:', payload.record.email);
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the register webhook function
    const { data, error } = await supabase.functions.invoke('register-webhook', {
      body: payload
    });

    if (error) {
      console.error('❌ Failed to trigger register webhook:', error);
      throw error;
    }

    console.log('✅ Register webhook triggered successfully:', data);
    return data;

  } catch (error) {
    console.error('❌ Error triggering register webhook:', error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    const userId = record.id
    const userEmail = record.email
    const userMetadata = record.raw_user_meta_data || {}

    console.log(`Processing user creation for: ${userEmail} (ID: ${userId})`)

    // Extract company domain from email
    const emailDomain = userEmail.split('@')[1]
    if (!emailDomain) {
      throw new Error('Invalid email format - cannot extract domain')
    }

    console.log(`Extracted domain: ${emailDomain}`)

    // Check if client already exists for this domain
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('company_domain', emailDomain)
      .single()

    if (clientCheckError && clientCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing client:', clientCheckError)
      throw new Error(`Database error during client lookup: ${clientCheckError.message}`)
    }

    let clientId: string

    if (existingClient) {
      // Client exists, use existing one
      clientId = existingClient.id
      console.log(`Using existing client: ${existingClient.company_name} (ID: ${clientId})`)
    } else {
      // Create new client
      const companyName = userMetadata.company_name || 
                         emailDomain.split('.')[0].charAt(0).toUpperCase() + 
                         emailDomain.split('.')[0].slice(1)

      console.log(`Creating new client: ${companyName}`)

      const { data: newClient, error: clientCreateError } = await supabase
        .from('clients')
        .insert({
          company_name: companyName,
          company_email: userEmail,
          company_domain: emailDomain,
          billing_status: 'unpaid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (clientCreateError) {
        console.error('Error creating client:', clientCreateError)
        throw new Error(`Failed to create client: ${clientCreateError.message}`)
      }

      clientId = newClient.id
      console.log(`Created new client with ID: ${clientId}`)
    }

    // Check if user is already linked to this client
    const { data: existingRelation, error: relationCheckError } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .single()

    if (relationCheckError && relationCheckError.code !== 'PGRST116') {
      console.error('Error checking existing client-user relation:', relationCheckError)
      throw new Error(`Database error during relation lookup: ${relationCheckError.message}`)
    }

    if (existingRelation) {
      console.log(`User already linked to client - skipping relation creation`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already linked to client',
          client_id: clientId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create client-user relationship
    console.log(`Creating client-user relationship`)
    
    const { error: relationError } = await supabase
      .from('client_users')
      .insert({
        user_id: userId,
        client_id: clientId,
        role: 'admin', // First user from a domain becomes admin
        created_at: new Date().toISOString()
      })

    if (relationError) {
      console.error('Error creating client-user relation:', relationError)
      throw new Error(`Failed to create client-user relation: ${relationError.message}`)
    }

    console.log(`Successfully processed user creation for ${userEmail}`)

    // 🎯 TRIGGER WEBHOOK AFTER SUCCESSFUL USER-CLIENT RELATIONSHIP
    try {
      console.log('🚀 Triggering registration webhook...');
      await triggerRegisterWebhook({ record });
      console.log('✅ Registration webhook triggered successfully');
    } catch (webhookError) {
      console.error('⚠️ Webhook trigger failed, but user creation was successful:', webhookError);
      // Don't fail the entire request if webhook fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User successfully linked to client',
        client_id: clientId,
        user_id: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in on-user-created function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
