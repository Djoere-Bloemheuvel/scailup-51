
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UseCreditRequest {
  module_id: string;
  credit_type: string;
  amount: number;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody: UseCreditRequest = await req.json();
    const { module_id, credit_type, amount, description } = requestBody;

    console.log('Use credits request:', { user_id: user.id, module_id, credit_type, amount, description });

    // First, get the client record
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check available credits
    const { data: availableCredits, error: creditsError } = await supabaseClient
      .from('credit_balances')
      .select('*')
      .eq('client_id', client.id)
      .eq('module_id', module_id)
      .eq('credit_type', credit_type)
      .gt('amount', 0)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return new Response(JSON.stringify({ error: 'Error fetching credits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!availableCredits || availableCredits.length === 0) {
      return new Response(JSON.stringify({ error: 'No credits available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total available credits
    const totalAvailable = availableCredits.reduce((sum, credit) => sum + credit.amount, 0);

    if (totalAvailable < amount) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        available: totalAvailable,
        requested: amount
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use credits starting from the ones that expire first
    let remainingToUse = amount;
    const updates = [];

    for (const credit of availableCredits) {
      if (remainingToUse <= 0) break;

      const useFromThis = Math.min(remainingToUse, credit.amount);
      const newAmount = credit.amount - useFromThis;

      updates.push({
        id: credit.id,
        amount: newAmount
      });

      remainingToUse -= useFromThis;
    }

    // Update credit balances
    for (const update of updates) {
      const { error: updateError } = await supabaseClient
        .from('credit_balances')
        .update({ amount: update.amount, updated_at: new Date().toISOString() })
        .eq('id', update.id);

      if (updateError) {
        console.error('Error updating credit balance:', updateError);
        return new Response(JSON.stringify({ error: 'Error updating credits' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Log the usage
    const { error: logError } = await supabaseClient
      .from('credit_usage_logs')
      .insert({
        client_id: client.id,
        module_id,
        credit_type,
        amount,
        description,
        used_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging credit usage:', logError);
      // Don't fail the request if logging fails
    }

    console.log('Credits used successfully:', { amount, credit_type, module_id });

    return new Response(JSON.stringify({ 
      success: true, 
      used: amount,
      remaining: totalAvailable - amount
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in use-credits function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
