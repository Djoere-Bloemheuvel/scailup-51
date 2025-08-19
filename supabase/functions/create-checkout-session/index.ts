import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  session_token: string;
  client_name: string;
  contact_email: string;
  allowed_domain: string;
  billing_plan: string;
  billing_cycle: 'monthly' | 'yearly';
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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-12-18.acacia',
    });

    const requestBody: CheckoutRequest = await req.json();
    const { 
      session_token, 
      client_name, 
      contact_email, 
      allowed_domain, 
      billing_plan, 
      billing_cycle 
    } = requestBody;

    console.log('Creating checkout session for:', { client_name, contact_email, billing_plan });

    // Get billing plan details
    const { data: billingPlan, error: planError } = await supabaseClient
      .from('billing_plans')
      .select('*')
      .eq('slug', billing_plan)
      .single();

    if (planError || !billingPlan) {
      console.error('Billing plan not found:', planError);
      return new Response(JSON.stringify({ error: 'Billing plan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate price based on billing cycle
    const price = billing_cycle === 'monthly' ? billingPlan.price_monthly : billingPlan.price_yearly;
    const interval = billing_cycle === 'monthly' ? 'month' : 'year';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${billingPlan.name} Plan - ${client_name}`,
              description: `ScailUp ${billingPlan.name} plan voor ${client_name}`,
            },
            unit_amount: price,
            recurring: {
              interval: interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('SITE_URL')}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('SITE_URL')}/onboarding/cancel`,
      customer_email: contact_email,
      metadata: {
        session_token,
        client_name,
        contact_email,
        allowed_domain,
        billing_plan,
        billing_cycle,
      },
      subscription_data: {
        metadata: {
          session_token,
          client_name,
          contact_email,
          allowed_domain,
          billing_plan,
          billing_cycle,
        },
      },
    });

    // Update onboarding session with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('onboarding_sessions')
      .update({ 
        stripe_session_id: session.id,
        status: 'pending'
      })
      .eq('session_token', session_token);

    if (updateError) {
      console.error('Error updating onboarding session:', updateError);
      // Don't fail the request if this update fails
    }

    console.log('Checkout session created:', session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-checkout-session function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 