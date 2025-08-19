
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== INSTANTLY CAMPAIGN CREATION v2.0 ===')
  console.log('Method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('📥 Request received:', JSON.stringify(requestBody, null, 2))

    const { record, old_record } = requestBody
    
    // Only process INSERT operations for new campaigns
    if (!record || old_record) {
      console.log('⏭️  Skipping - not a new campaign insert')
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Not a new campaign insert' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Skip if campaign already has an instantly_campaign_id
    if (record.instantly_campaign_id) {
      console.log('⏭️  Campaign already has Instantly ID:', record.instantly_campaign_id)
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Campaign already linked to Instantly' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Get environment configuration
    const instantlyApiKey = Deno.env.get('INSTANTLY_API_KEY') || 'ZTYyOWJkMTQtNDVlMi00YjI3LWE3OWQtNjIyNjc3ZWM3OTJlOkVKSkRneWNBT0ZjUg=='
    const mailboxEmail = Deno.env.get('INSTANTLY_MAILBOX_EMAIL') || 'degroot@inboxnl.com'
    const dailyLimit = parseInt(Deno.env.get('INSTANTLY_DAILY_LIMIT') || '30')

    console.log('🔧 Configuration:', { 
      hasApiKey: !!instantlyApiKey, 
      mailboxEmail, 
      dailyLimit,
      campaignId: record.id,
      campaignName: record.name
    })

    // Fetch complete campaign data including email sequences
    const { data: campaignData, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select(`
        id, name, description, type,
        email_step_1_subject_a, email_step_1_body_a,
        email_step_2_delay_a, email_step_2_time_a, email_step_2_subject_a, email_step_2_body_a,
        email_step_1_subject_b, email_step_1_body_b,
        email_step_2_delay_b, email_step_2_time_b, email_step_2_subject_b, email_step_2_body_b,
        ab_test_enabled
      `)
      .eq('id', record.id)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch campaign data:', fetchError)
      throw new Error(`Failed to fetch campaign: ${fetchError.message}`)
    }

    console.log('📊 Campaign data:', JSON.stringify(campaignData, null, 2))

    // Build email sequences based on campaign data
    const sequences = []
    
    // Always include variant A
    const variantASteps = []
    
    // Step 1 - Initial email
    if (campaignData.email_step_1_subject_a && campaignData.email_step_1_body_a) {
      variantASteps.push({
        step_number: 1,
        subject: campaignData.email_step_1_subject_a,
        body: campaignData.email_step_1_body_a,
        delay: 0,
        variant: 'A'
      })
    }
    
    // Step 2 - Follow-up email  
    if (campaignData.email_step_2_subject_a && campaignData.email_step_2_body_a) {
      variantASteps.push({
        step_number: 2,
        subject: campaignData.email_step_2_subject_a,
        body: campaignData.email_step_2_body_a,
        delay: (campaignData.email_step_2_delay_a || 2) * 24 * 60, // Convert days to minutes
        variant: 'A'
      })
    }

    if (variantASteps.length > 0) {
      sequences.push({
        steps: variantASteps
      })
    }

    // Add variant B if A/B testing is enabled and variant B content exists
    if (campaignData.ab_test_enabled && 
        campaignData.email_step_1_subject_b && 
        campaignData.email_step_1_body_b) {
      
      const variantBSteps = []
      
      // Step 1 - Initial email B
      variantBSteps.push({
        step_number: 1,
        subject: campaignData.email_step_1_subject_b,
        body: campaignData.email_step_1_body_b,
        delay: 0,
        variant: 'B'
      })
      
      // Step 2 - Follow-up email B
      if (campaignData.email_step_2_subject_b && campaignData.email_step_2_body_b) {
        variantBSteps.push({
          step_number: 2,
          subject: campaignData.email_step_2_subject_b,
          body: campaignData.email_step_2_body_b,
          delay: (campaignData.email_step_2_delay_b || 2) * 24 * 60, // Convert days to minutes
          variant: 'B'
        })
      }

      sequences.push({
        steps: variantBSteps
      })
    }

    // Fallback if no email content is provided
    if (sequences.length === 0) {
      console.log('⚠️  No email sequences found, creating default sequence')
      sequences.push({
        steps: [{
          step_number: 1,
          subject: `Introduction to ${campaignData.name}`,
          body: `Hi {{first_name}},\n\nI hope this email finds you well.\n\nI wanted to reach out regarding ${campaignData.description || 'our services'}.\n\nBest regards,\n{{sender_name}}`,
          delay: 0,
          variant: 'A'
        }]
      })
    }

    // Prepare complete Instantly campaign data according to API v2 specification
    const instantlyCampaignData = {
      name: campaignData.name || 'Unnamed Campaign',
      campaign_schedule: {
        schedules: [{
          name: "Business Hours NL",
          timing: {
            from: "09:00",
            to: "17:00"
          },
          days: {
            0: false, // Sunday
            1: true,  // Monday
            2: true,  // Tuesday  
            3: true,  // Wednesday
            4: true,  // Thursday
            5: true,  // Friday
            6: false  // Saturday
          },
          timezone: "Europe/Amsterdam"
        }],
        start_date: new Date().toISOString(),
        end_date: null // No end date for evergreen campaigns
      },
      sequences: sequences,
      email_list: [mailboxEmail],
      daily_limit: dailyLimit,
      stop_on_reply: true,
      stop_on_auto_reply: true,
      link_tracking: true,
      open_tracking: true,
      text_only: false,
      is_evergreen: true,
      email_gap: 10, // 10 minutes between emails
      random_wait_max: 30, // Up to 30 minutes random delay
      prioritize_new_leads: true,
      stop_for_company: false, // Don't stop entire company on single reply
      insert_unsubscribe_header: true,
      allow_risky_contacts: false,
      disable_bounce_protect: false
    }

    console.log('🚀 Sending to Instantly API v2:', JSON.stringify(instantlyCampaignData, null, 2))

    // Make API call to Instantly
    const instantlyResponse = await fetch('https://api.instantly.ai/api/v2/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instantlyApiKey}`,
      },
      body: JSON.stringify(instantlyCampaignData)
    })

    console.log('📡 Instantly API response status:', instantlyResponse.status)
    console.log('📡 Instantly API response headers:', Object.fromEntries(instantlyResponse.headers.entries()))

    const responseText = await instantlyResponse.text()
    console.log('📡 Instantly API response body:', responseText)

    if (!instantlyResponse.ok) {
      console.error('❌ Instantly API error:', {
        status: instantlyResponse.status,
        statusText: instantlyResponse.statusText,
        body: responseText
      })
      
      let errorMessage = 'Kon Instantly-campagne niet aanmaken.'
      let errorDetails = responseText
      
      if (instantlyResponse.status === 401) {
        errorMessage = 'Instantly API authenticatie gefaald. Controleer API key.'
      } else if (instantlyResponse.status === 429) {
        errorMessage = 'Instantly API rate limit bereikt. Probeer later opnieuw.'
      } else if (instantlyResponse.status === 400) {
        errorMessage = 'Ongeldige campagne data. Controleer email content en configuratie.'
      } else if (instantlyResponse.status === 422) {
        errorMessage = 'Instantly validatie gefaald. Controleer verplichte velden.'
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Instantly API error: ${instantlyResponse.status}`,
        details: errorDetails,
        message: errorMessage,
        campaign_data: instantlyCampaignData // For debugging
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    let instantlyResult
    try {
      instantlyResult = JSON.parse(responseText)
      console.log('✅ Parsed Instantly response:', JSON.stringify(instantlyResult, null, 2))
    } catch (parseError) {
      console.error('❌ Failed to parse Instantly response:', parseError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to parse Instantly response',
        details: responseText,
        message: 'Onverwacht antwoord van Instantly API.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Extract campaign ID from response
    const instantlyCampaignId = instantlyResult.id || 
                               instantlyResult.campaign_id || 
                               instantlyResult.data?.id || 
                               instantlyResult.data?.campaign_id

    console.log('🆔 Extracted campaign ID:', instantlyCampaignId)

    if (!instantlyCampaignId) {
      console.error('❌ No campaign ID found in response:', instantlyResult)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No campaign ID in Instantly response',
        details: instantlyResult,
        message: 'Campagne aangemaakt maar geen ID ontvangen van Instantly.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Update campaign with Instantly ID and mailbox info
    console.log('💾 Updating campaign with Instantly data...')
    
    const { error: updateError } = await supabaseClient
      .from('campaigns')
      .update({ 
        instantly_campaign_id: instantlyCampaignId,
        instantly_mailbox_id: mailboxEmail
      })
      .eq('id', record.id)

    if (updateError) {
      console.error('❌ Error updating campaign:', updateError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to update campaign with Instantly data',
        details: updateError.message,
        message: 'Campagne aangemaakt in Instantly maar lokale update mislukt.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    console.log('🎉 SUCCESS! Campaign created and linked!')

    return new Response(JSON.stringify({ 
      success: true, 
      instantly_campaign_id: instantlyCampaignId,
      mailbox_email: mailboxEmail,
      daily_limit: dailyLimit,
      sequences_count: sequences.length,
      message: `Instantly-campagne "${campaignData.name}" succesvol aangemaakt met ${sequences.length} email sequence(s).`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('💥 Critical error in create-instantly-campaign:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      message: 'Er is een technische fout opgetreden bij het aanmaken van de Instantly-campagne.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
