
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SchedulerResponse {
  success: boolean
  processed_clients: number
  failed_clients: number
  errors: string[]
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  console.log('Credit reset scheduler started at:', new Date().toISOString())

  try {
    // Create Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current date for processing
    const today = new Date()
    const todayDateString = today.toISOString().split('T')[0]
    
    console.log(`Processing credit resets for date: ${todayDateString}`)

    // Find clients eligible for credit reset
    // Logic: billing_date + 1 day = today AND billing_status = 'paid'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDateString = yesterday.toISOString().split('T')[0]

    const { data: eligibleClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, company_name, billing_date, billing_status, last_credits_reset_at')
      .eq('billing_status', 'paid')
      .eq('billing_date', yesterdayDateString)

    if (clientsError) {
      console.error('Error fetching eligible clients:', clientsError)
      throw new Error(`Failed to fetch eligible clients: ${clientsError.message}`)
    }

    if (!eligibleClients || eligibleClients.length === 0) {
      console.log('No clients eligible for credit reset today')
      return new Response(JSON.stringify({
        success: true,
        processed_clients: 0,
        failed_clients: 0,
        errors: [],
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${eligibleClients.length} clients eligible for credit reset`)

    // Check for idempotency - filter out clients already reset today
    const clientsToProcess = eligibleClients.filter(client => {
      if (!client.last_credits_reset_at) return true
      
      const lastResetDate = new Date(client.last_credits_reset_at).toISOString().split('T')[0]
      const shouldProcess = lastResetDate !== todayDateString
      
      if (!shouldProcess) {
        console.log(`Skipping client ${client.id} - already reset today`)
      }
      
      return shouldProcess
    })

    console.log(`Processing ${clientsToProcess.length} clients after idempotency check`)

    const results: SchedulerResponse = {
      success: true,
      processed_clients: 0,
      failed_clients: 0,
      errors: [],
      timestamp: new Date().toISOString()
    }

    // Process each client by calling the credit-reset-processor function
    for (const client of clientsToProcess) {
      try {
        console.log(`Processing client: ${client.id} (${client.company_name})`)
        
        // Call the credit-reset-processor function
        const { data: processorResult, error: processorError } = await supabase.functions.invoke(
          'credit-reset-processor',
          {
            body: {
              client_id: client.id,
              reset_date: todayDateString,
              billing_cycle_start: client.billing_date
            }
          }
        )

        if (processorError) {
          console.error(`Error processing client ${client.id}:`, processorError)
          results.failed_clients++
          results.errors.push(`Client ${client.id}: ${processorError.message}`)
          continue
        }

        if (!processorResult?.success) {
          console.error(`Processor failed for client ${client.id}:`, processorResult?.error)
          results.failed_clients++
          results.errors.push(`Client ${client.id}: ${processorResult?.error || 'Unknown processor error'}`)
          continue
        }

        console.log(`Successfully processed client ${client.id}`)
        results.processed_clients++

      } catch (error) {
        console.error(`Exception processing client ${client.id}:`, error)
        results.failed_clients++
        results.errors.push(`Client ${client.id}: ${error.message}`)
      }
    }

    // Log the final results
    const processingTime = Date.now() - startTime
    console.log(`Credit reset scheduler completed in ${processingTime}ms`)
    console.log(`Results: ${results.processed_clients} processed, ${results.failed_clients} failed`)
    
    if (results.errors.length > 0) {
      console.error('Errors encountered:', results.errors)
    }

    // Set overall success based on whether any clients were processed successfully
    results.success = results.processed_clients > 0 || (results.processed_clients === 0 && results.failed_clients === 0)

    return new Response(JSON.stringify(results), {
      status: results.success ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Critical error in credit reset scheduler:', error)
    
    const errorResponse: SchedulerResponse = {
      success: false,
      processed_clients: 0,
      failed_clients: 0,
      errors: [error.message],
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
