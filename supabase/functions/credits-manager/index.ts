import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreditRequest {
  action: 'add' | 'use' | 'check' | 'get_balance' | 'set_unlimited' | 'get_transactions'
  module_id?: string
  credit_type?: string
  amount?: number
  description?: string
  related_id?: string
  expires_at?: string
  client_id?: string // Only for admin operations
}

interface CreditResponse {
  success: boolean
  data?: any
  error?: string
  balance?: number
  is_unlimited?: boolean
}

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number, resetTime: number }>()

function checkRateLimit(userId: string, action: string): boolean {
  const key = `${userId}:${action}`
  const now = Date.now()
  const limit = rateLimitCache.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 100) { // 100 requests per minute
    return false
  }
  
  limit.count++
  return true
}

function isSuperAdmin(email: string): boolean {
  return email === 'djoere@scailup.io'
}

async function getClientId(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) return null

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.user.email)
      .single()

    if (clientError || !client) return null
    return client.id
  } catch (error) {
    console.error('Error getting client ID:', error)
    return null
  }
}

async function addCredits(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    if (!request.module_id || !request.credit_type || !request.amount) {
      return { success: false, error: 'Missing required parameters' }
    }

    const { data, error } = await supabase.rpc('add_credits', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type,
      p_amount: request.amount,
      p_expires_at: request.expires_at || null,
      p_description: request.description || 'Credits added via Edge Function'
    })

    if (error) {
      console.error('Error adding credits:', error)
      return { success: false, error: error.message }
    }

    // Get updated balance
    const { data: balanceData, error: balanceError } = await supabase.rpc('get_credit_balance', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type
    })

    return {
      success: true,
      data: { added: request.amount },
      balance: balanceError ? 0 : balanceData
    }
  } catch (error) {
    console.error('Exception in addCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

async function useCredits(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    if (!request.module_id || !request.credit_type || !request.amount) {
      return { success: false, error: 'Missing required parameters' }
    }

    // Check if user has unlimited credits
    const { data: creditData, error: creditError } = await supabase
      .from('credits')
      .select('is_unlimited, balance')
      .eq('client_id', clientId)
      .eq('module_id', request.module_id)
      .eq('credit_type', request.credit_type)
      .single()

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Error checking credits:', creditError)
      return { success: false, error: 'Error checking credit balance' }
    }

    if (creditData?.is_unlimited) {
      return {
        success: true,
        data: { used: request.amount },
        balance: 999999999,
        is_unlimited: true
      }
    }

    const { data, error } = await supabase.rpc('use_credits', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type,
      p_amount: request.amount,
      p_description: request.description || 'Credits used via Edge Function',
      p_related_id: request.related_id || null
    })

    if (error) {
      console.error('Error using credits:', error)
      return { success: false, error: error.message }
    }

    // Get updated balance
    const { data: balanceData, error: balanceError } = await supabase.rpc('get_credit_balance', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type
    })

    return {
      success: true,
      data: { used: request.amount },
      balance: balanceError ? 0 : balanceData
    }
  } catch (error) {
    console.error('Exception in useCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

async function checkCredits(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    if (!request.module_id || !request.credit_type || !request.amount) {
      return { success: false, error: 'Missing required parameters' }
    }

    const { data: creditData, error: creditError } = await supabase
      .from('credits')
      .select('is_unlimited, balance')
      .eq('client_id', clientId)
      .eq('module_id', request.module_id)
      .eq('credit_type', request.credit_type)
      .single()

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Error checking credits:', creditError)
      return { success: false, error: 'Error checking credit balance' }
    }

    if (!creditData) {
      return { success: false, error: 'No credits found for this module and type' }
    }

    const hasEnough = creditData.is_unlimited || creditData.balance >= request.amount

    return {
      success: true,
      data: { 
        has_enough: hasEnough,
        required: request.amount,
        available: creditData.balance
      },
      balance: creditData.balance,
      is_unlimited: creditData.is_unlimited
    }
  } catch (error) {
    console.error('Exception in checkCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

async function getBalance(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    if (!request.module_id || !request.credit_type) {
      return { success: false, error: 'Missing required parameters' }
    }

    const { data: balance, error } = await supabase.rpc('get_credit_balance', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type
    })

    if (error) {
      console.error('Error getting balance:', error)
      return { success: false, error: error.message }
    }

    // Check if unlimited
    const { data: creditData, error: creditError } = await supabase
      .from('credits')
      .select('is_unlimited')
      .eq('client_id', clientId)
      .eq('module_id', request.module_id)
      .eq('credit_type', request.credit_type)
      .single()

    return {
      success: true,
      data: { balance },
      balance: balance || 0,
      is_unlimited: creditData?.is_unlimited || false
    }
  } catch (error) {
    console.error('Exception in getBalance:', error)
    return { success: false, error: 'Internal server error' }
  }
}

async function setUnlimitedCredits(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    if (!request.module_id || !request.credit_type) {
      return { success: false, error: 'Missing required parameters' }
    }

    const { data, error } = await supabase.rpc('set_unlimited_credits', {
      p_client_id: clientId,
      p_module_id: request.module_id,
      p_credit_type: request.credit_type
    })

    if (error) {
      console.error('Error setting unlimited credits:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: { unlimited: true },
      balance: 999999999,
      is_unlimited: true
    }
  } catch (error) {
    console.error('Exception in setUnlimitedCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

async function getTransactions(supabase: any, request: CreditRequest, clientId: string): Promise<CreditResponse> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(request.amount || 50)

    if (error) {
      console.error('Error getting transactions:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: { transactions: data || [] }
    }
  } catch (error) {
    console.error('Exception in getTransactions:', error)
    return { success: false, error: 'Internal server error' }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set auth context
    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting
    if (!checkRateLimit(user.id, 'credits')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const request: CreditRequest = await req.json()
    
    if (!request.action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client ID
    let clientId = request.client_id // For admin operations
    
    if (!clientId) {
      clientId = await getClientId(supabase, user.id)
      if (!clientId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Client not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check admin permissions for certain operations
    const isAdmin = isSuperAdmin(user.email || '')
    if (request.action === 'set_unlimited' && !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different actions
    let response: CreditResponse

    switch (request.action) {
      case 'add':
        response = await addCredits(supabase, request, clientId)
        break
      case 'use':
        response = await useCredits(supabase, request, clientId)
        break
      case 'check':
        response = await checkCredits(supabase, request, clientId)
        break
      case 'get_balance':
        response = await getBalance(supabase, request, clientId)
        break
      case 'set_unlimited':
        if (!isAdmin) {
          response = { success: false, error: 'Admin privileges required' }
        } else {
          response = await setUnlimitedCredits(supabase, request, clientId)
        }
        break
      case 'get_transactions':
        response = await getTransactions(supabase, request, clientId)
        break
      default:
        response = { success: false, error: 'Invalid action' }
    }

    // Log the operation for monitoring
    if (response.success) {
      console.log(`Credit operation: ${request.action} for user ${user.email}, client ${clientId}`)
    } else {
      console.error(`Credit operation failed: ${request.action} for user ${user.email}, error: ${response.error}`)
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 