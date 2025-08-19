
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] Cron status check requested`)

    // Check cron jobs status
    const { data: cronJobs, error: cronError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT jobname, schedule, active, database 
          FROM cron.job 
          WHERE jobname IN ('process-pending-user-tasks', 'test-cron-job')
          ORDER BY created_at DESC
        `
      })

    if (cronError) {
      console.error('Error checking cron jobs:', cronError)
    }

    // Check recent cron job runs
    const { data: cronRuns, error: runsError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT jobname, runid, status, return_message, start_time, end_time
          FROM cron.job_run_details 
          WHERE jobname = 'process-pending-user-tasks'
          ORDER BY start_time DESC 
          LIMIT 5
        `
      })

    if (runsError) {
      console.error('Error checking cron runs:', runsError)
    }

    // Check pending tasks status
    const { data: taskStats, error: statsError } = await supabase
      .from('pending_user_tasks')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error }
        
        const stats = data?.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        }, {}) || {}
        
        return { data: stats, error: null }
      })

    if (statsError) {
      console.error('Error checking task stats:', statsError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp,
        cron_jobs: cronJobs || [],
        recent_runs: cronRuns || [],
        task_statistics: taskStats || {},
        system_status: {
          cron_active: cronJobs?.some(job => job.active) || false,
          last_run: cronRuns?.[0]?.start_time || null,
          last_status: cronRuns?.[0]?.status || null
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] Error in cron status check:`, {
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
        status: 500,
      }
    )
  }
})
