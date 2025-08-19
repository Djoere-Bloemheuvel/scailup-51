
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RolloverRequest {
  client_id: string
  module: string
  credit_type: string
  rollover_months: number
  reset_date: string
}

interface RolloverResponse {
  success: boolean
  client_id: string
  module: string
  credit_type: string
  rollover_amount: number
  expired_amount: number
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
    const request: RolloverRequest = await req.json()
    const { client_id, module, credit_type, rollover_months, reset_date } = request

    console.log(`Processing rollover for client ${client_id}, module ${module}, credit_type ${credit_type}`)

    // Calculate rollover cutoff date
    const cutoffDate = new Date(reset_date)
    cutoffDate.setMonth(cutoffDate.getMonth() - rollover_months)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    console.log(`Rollover cutoff date: ${cutoffDateString} (${rollover_months} months ago)`)

    // Get current credit usage for this module/credit_type
    const { data: currentCredits, error: currentError } = await supabase
      .from('client_credits')
      .select('used_this_period, period_start')
      .eq('client_id', client_id)
      .eq('module', module)
      .eq('credit_type', credit_type)
      .single()

    if (currentError && currentError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch current credits: ${currentError.message}`)
    }

    // Get the module tier to determine monthly limit
    const { data: moduleData, error: moduleError } = await supabase
      .from('client_modules')
      .select(`
        module_tiers!inner (
          module_tier_credits!inner (
            amount
          )
        )
      `)
      .eq('client_id', client_id)
      .eq('module', module)
      .single()

    if (moduleError) {
      throw new Error(`Failed to fetch module data: ${moduleError.message}`)
    }

    const tierCredit = moduleData.module_tiers.module_tier_credits.find(
      (tc: any) => tc.credit_type === credit_type
    )

    if (!tierCredit) {
      throw new Error(`No tier credit found for ${module}:${credit_type}`)
    }

    const monthlyLimit = tierCredit.amount
    const currentUsage = currentCredits?.used_this_period || 0
    const currentUnusedCredits = Math.max(0, monthlyLimit - currentUsage)

    console.log(`Current usage: ${currentUsage}/${monthlyLimit}, unused: ${currentUnusedCredits}`)

    // Get historical unused credits that can be rolled over
    const { data: historicalCredits, error: historicalError } = await supabase
      .from('credit_logs')
      .select('change, reason, created_at')
      .eq('client_id', client_id)
      .eq('module', module)
      .eq('credit_type', credit_type)
      .like('reason', '%rollover%')
      .gte('created_at', cutoffDateString)
      .order('created_at', { ascending: false })

    if (historicalError) {
      console.warn(`Could not fetch historical rollover credits: ${historicalError.message}`)
    }

    // Calculate total rollover amount
    let rolloverAmount = currentUnusedCredits
    let expiredAmount = 0

    // Add any existing rollover credits that haven't expired
    if (historicalCredits) {
      const validRolloverCredits = historicalCredits.filter(credit => {
        const creditDate = new Date(credit.created_at)
        return creditDate >= cutoffDate && credit.change > 0
      })

      const totalHistoricalRollover = validRolloverCredits.reduce((sum, credit) => sum + credit.change, 0)
      rolloverAmount += totalHistoricalRollover

      console.log(`Found ${totalHistoricalRollover} credits from historical rollover`)
    }

    // Get expired rollover credits for logging
    if (historicalCredits) {
      const expiredCredits = historicalCredits.filter(credit => {
        const creditDate = new Date(credit.created_at)
        return creditDate < cutoffDate && credit.change > 0
      })

      expiredAmount = expiredCredits.reduce((sum, credit) => sum + credit.change, 0)
    }

    console.log(`Rollover calculation: ${rolloverAmount} to rollover, ${expiredAmount} expired`)

    // Apply rollover if there are credits to rollover
    if (rolloverAmount > 0) {
      // Log the rollover
      const { error: logError } = await supabase
        .from('credit_logs')
        .insert({
          client_id,
          module: module,
          credit_type,
          change: rolloverAmount,
          reason: `Credit rollover - ${rolloverAmount} unused credits carried forward`,
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error(`Failed to log rollover credits:`, logError)
        // Continue processing even if logging fails
      }

      console.log(`Applied rollover: ${rolloverAmount} credits for ${module}:${credit_type}`)
    }

    // Log expired credits if any
    if (expiredAmount > 0) {
      const { error: expiredLogError } = await supabase
        .from('credit_logs')
        .insert({
          client_id,
          module: module,
          credit_type,
          change: -expiredAmount,
          reason: `Credit expiration - ${expiredAmount} rollover credits expired after ${rollover_months} months`,
          created_at: new Date().toISOString()
        })

      if (expiredLogError) {
        console.error(`Failed to log expired credits:`, expiredLogError)
        // Continue processing even if logging fails
      }

      console.log(`Expired rollover: ${expiredAmount} credits for ${module}:${credit_type}`)
    }

    const response: RolloverResponse = {
      success: true,
      client_id,
      module,
      credit_type,
      rollover_amount: rolloverAmount,
      expired_amount: expiredAmount,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in credit rollover handler:', error)
    
    const errorResponse: RolloverResponse = {
      success: false,
      client_id: (await req.json().catch(() => ({})))?.client_id || 'unknown',
      module: (await req.json().catch(() => ({})))?.module || 'unknown',
      credit_type: (await req.json().catch(() => ({})))?.credit_type || 'unknown',
      rollover_amount: 0,
      expired_amount: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
