
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessorRequest {
  client_id: string
  reset_date: string
  billing_cycle_start: string
}

interface ProcessorResponse {
  success: boolean
  client_id: string
  credits_allocated: number
  rollover_applied: number
  error?: string
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const request: ProcessorRequest = await req.json()
    const { client_id, reset_date, billing_cycle_start } = request

    console.log(`Processing credit reset for client ${client_id} on ${reset_date}`)

    // Validate client exists and is eligible
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name, billing_status, billing_date, last_credits_reset_at')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      throw new Error(`Client not found: ${clientError?.message || 'Unknown error'}`)
    }

    // Double-check billing eligibility
    if (client.billing_status !== 'paid') {
      throw new Error(`Client ${client_id} is not eligible for credit reset (billing_status: ${client.billing_status})`)
    }

    // Check idempotency - ensure not already reset today
    if (client.last_credits_reset_at) {
      const lastResetDate = new Date(client.last_credits_reset_at).toISOString().split('T')[0]
      if (lastResetDate === reset_date) {
        throw new Error(`Client ${client_id} credits already reset today`)
      }
    }

    // Get client's active modules and their tier credits
    const { data: clientModules, error: modulesError } = await supabase
      .from('client_modules')
      .select(`
        client_id,
        module,
        tier,
        module_tiers!inner (
          id,
          name,
          module_tier_credits (
            credit_type,
            amount,
            reset_interval,
            rollover_months
          )
        )
      `)
      .eq('client_id', client_id)
      .not('activated_at', 'is', null)

    if (modulesError) {
      throw new Error(`Failed to fetch client modules: ${modulesError.message}`)
    }

    if (!clientModules || clientModules.length === 0) {
      console.log(`No active modules found for client ${client_id}`)
      return new Response(JSON.stringify({
        success: true,
        client_id,
        credits_allocated: 0,
        rollover_applied: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let totalCreditsAllocated = 0
    let totalRolloverApplied = 0

    // Process each module's credits
    for (const clientModule of clientModules) {
      const moduleTier = clientModule.module_tiers
      if (!moduleTier?.module_tier_credits) continue

      console.log(`Processing module ${clientModule.module} (${clientModule.tier}) for client ${client_id}`)

      for (const tierCredit of moduleTier.module_tier_credits) {
        try {
          // Handle rollover if applicable
          let rolloverAmount = 0
          if (tierCredit.rollover_months > 0) {
            console.log(`Processing rollover for ${clientModule.module}:${tierCredit.credit_type}`)
            
            // Call rollover handler
            const { data: rolloverResult, error: rolloverError } = await supabase.functions.invoke(
              'credit-rollover-handler',
              {
                body: {
                  client_id,
                  module: clientModule.module,
                  credit_type: tierCredit.credit_type,
                  rollover_months: tierCredit.rollover_months,
                  reset_date
                }
              }
            )

            if (rolloverError) {
              console.error(`Rollover error for ${clientModule.module}:${tierCredit.credit_type}:`, rolloverError)
              // Continue processing even if rollover fails
            } else if (rolloverResult?.success) {
              rolloverAmount = rolloverResult.rollover_amount || 0
              totalRolloverApplied += rolloverAmount
              console.log(`Applied rollover: ${rolloverAmount} for ${clientModule.module}:${tierCredit.credit_type}`)
            }
          }

          // Reset current period usage and allocate new credits
          const { error: resetError } = await supabase
            .from('client_credits')
            .upsert({
              client_id,
              module: clientModule.module,
              credit_type: tierCredit.credit_type,
              used_this_period: 0,
              period_start: reset_date,
              reset_interval: tierCredit.reset_interval,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'client_id,module,credit_type'
            })

          if (resetError) {
            console.error(`Error resetting credits for ${clientModule.module}:${tierCredit.credit_type}:`, resetError)
            throw new Error(`Failed to reset credits: ${resetError.message}`)
          }

          // Log the credit allocation
          const { error: logError } = await supabase
            .from('credit_logs')
            .insert({
              client_id,
              module: clientModule.module,
              credit_type: tierCredit.credit_type,
              change: tierCredit.amount,
              reason: `Monthly credit reset - ${tierCredit.amount} credits allocated`,
              created_at: new Date().toISOString()
            })

          if (logError) {
            console.warn(`Failed to log credit allocation for ${clientModule.module}:${tierCredit.credit_type}:`, logError)
            // Continue processing even if logging fails
          }

          totalCreditsAllocated += tierCredit.amount
          console.log(`Allocated ${tierCredit.amount} ${tierCredit.credit_type} credits for ${clientModule.module}`)

        } catch (error) {
          console.error(`Error processing ${clientModule.module}:${tierCredit.credit_type}:`, error)
          // Continue processing other credits even if one fails
        }
      }
    }

    // Update client's last_credits_reset_at timestamp
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        last_credits_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', client_id)

    if (updateError) {
      console.error(`Failed to update client reset timestamp:`, updateError)
      // Don't fail the entire operation for this
    }

    console.log(`Credit reset completed for client ${client_id}: ${totalCreditsAllocated} allocated, ${totalRolloverApplied} rolled over`)

    const response: ProcessorResponse = {
      success: true,
      client_id,
      credits_allocated: totalCreditsAllocated,
      rollover_applied: totalRolloverApplied,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in credit reset processor:', error)
    
    const errorResponse: ProcessorResponse = {
      success: false,
      client_id: (await req.json().catch(() => ({})))?.client_id || 'unknown',
      credits_allocated: 0,
      rollover_applied: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
