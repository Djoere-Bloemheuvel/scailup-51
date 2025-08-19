
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const timestamp = new Date().toISOString()
    
    console.log(`[${timestamp}] Test cron function triggered`, {
      method: req.method,
      body: body,
      headers: Object.fromEntries(req.headers.entries()),
      environment: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    })
    
    // Check system health
    const healthCheck = {
      timestamp,
      cron_active: body.source === 'cron',
      environment_ready: !!(Deno.env.get('SUPABASE_URL') && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')),
      memory_usage: Deno.memoryUsage?.() || 'unavailable'
    }
    
    console.log(`[${timestamp}] System health check:`, healthCheck)
    
    return new Response(
      JSON.stringify({
        success: true,
        timestamp,
        message: 'Test cron function executed successfully',
        payload: body,
        health: healthCheck
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] Error in test cron function:`, {
      error: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        timestamp,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to keep cron running
      }
    )
  }
})
