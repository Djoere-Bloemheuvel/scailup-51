import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-12-18.acacia',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing webhook event:', event.type);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing completed checkout session:', session.id);

      // Get onboarding session
      const { data: onboardingSession, error: sessionError } = await supabaseClient
        .from('onboarding_sessions')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();

      if (sessionError || !onboardingSession) {
        console.error('Onboarding session not found:', sessionError);
        return new Response(JSON.stringify({ error: 'Onboarding session not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create Stripe customer if not exists
      let customerId = session.customer as string;
      if (!customerId && session.customer_email) {
        const customer = await stripe.customers.create({
          email: session.customer_email,
          name: onboardingSession.client_name,
          metadata: {
            client_name: onboardingSession.client_name,
            allowed_domain: onboardingSession.allowed_domain,
          },
        });
        customerId = customer.id;
      }

      // Create client
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .insert([{
          company_name: onboardingSession.client_name,
          allowed_domain: onboardingSession.allowed_domain,
          contact_email: onboardingSession.contact_email,
          billing_plan: onboardingSession.billing_plan,
          is_active: true,
          stripe_customer_id: customerId,
        }])
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        return new Response(JSON.stringify({ error: 'Error creating client' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update onboarding session status
      const { error: updateError } = await supabaseClient
        .from('onboarding_sessions')
        .update({ 
          status: 'completed',
          metadata: {
            ...onboardingSession.metadata,
            client_id: client.id,
            stripe_customer_id: customerId,
          }
        })
        .eq('id', onboardingSession.id);

      if (updateError) {
        console.error('Error updating onboarding session:', updateError);
      }

      // Send welcome email (you can implement this later)
      console.log('Client created successfully:', client.id);

      // Create client invite for the contact email
      const inviteToken = crypto.randomUUID();
      const { error: inviteError } = await supabaseClient
        .from('client_invites')
        .insert([{
          client_id: client.id,
          email: onboardingSession.contact_email,
          role: 'admin',
          token: inviteToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }]);

      if (inviteError) {
        console.error('Error creating client invite:', inviteError);
      }

      console.log('Onboarding completed for client:', client.id);
    }

    // Handle customer.subscription.created event
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log('Processing new subscription:', subscription.id);

      // Update client billing plan if needed
      if (subscription.metadata.client_id) {
        const { error: updateError } = await supabaseClient
          .from('clients')
          .update({ 
            billing_plan: subscription.metadata.billing_plan,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.metadata.client_id);

        if (updateError) {
          console.error('Error updating client billing plan:', updateError);
        }
      }
    }

    // Handle customer.subscription.updated event
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log('Processing subscription update:', subscription.id);

      // Update client status based on subscription status
      if (subscription.metadata.client_id) {
        const isActive = subscription.status === 'active';
        const { error: updateError } = await supabaseClient
          .from('clients')
          .update({ 
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.metadata.client_id);

        if (updateError) {
          console.error('Error updating client status:', updateError);
        }
      }
    }

    // Handle customer.subscription.deleted event
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log('Processing subscription deletion:', subscription.id);

      // Deactivate client
      if (subscription.metadata.client_id) {
        const { error: updateError } = await supabaseClient
          .from('clients')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.metadata.client_id);

        if (updateError) {
          console.error('Error deactivating client:', updateError);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stripe-webhook function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 