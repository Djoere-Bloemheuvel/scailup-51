import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your URL
const supabaseKey = 'your-anon-key'; // Replace with your anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getIds() {
  console.log('🔍 Fetching IDs for djoere@automatrz.nl...\n');

  try {
    // 1. Check if user exists in auth.users
    console.log('1. Checking auth.users...');
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', 'djoere@automatrz.nl')
      .single();

    if (authError) {
      console.log('   ❌ User not found in auth.users or error:', authError.message);
      console.log('   💡 The user needs to be created through Supabase Auth first');
    } else {
      console.log('   ✅ User found:');
      console.log(`      ID: ${authUser.id}`);
      console.log(`      Email: ${authUser.email}`);
      console.log(`      Created: ${authUser.created_at}`);
    }

    // 2. Check if client exists
    console.log('\n2. Checking existing clients...');
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name, company_email, created_at')
      .eq('company_email', 'djoere@automatrz.nl')
      .single();

    if (clientError) {
      console.log('   ❌ Client not found or error:', clientError.message);
    } else {
      console.log('   ✅ Client found:');
      console.log(`      ID: ${existingClient.id}`);
      console.log(`      Company: ${existingClient.company_name}`);
      console.log(`      Email: ${existingClient.company_email}`);
      console.log(`      Created: ${existingClient.created_at}`);
    }

    // 3. Check if user is already linked to a client
    console.log('\n3. Checking client_users...');
    const { data: clientUser, error: clientUserError } = await supabase
      .from('client_users')
      .select('client_id, user_id, email, role, created_at')
      .eq('email', 'djoere@automatrz.nl')
      .single();

    if (clientUserError) {
      console.log('   ❌ User not linked to any client or error:', clientUserError.message);
    } else {
      console.log('   ✅ User already linked to client:');
      console.log(`      Client ID: ${clientUser.client_id}`);
      console.log(`      User ID: ${clientUser.user_id}`);
      console.log(`      Role: ${clientUser.role}`);
      console.log(`      Created: ${clientUser.created_at}`);
    }

    // 4. Check existing modules
    console.log('\n4. Checking existing modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('client_modules')
      .select('module, tier, activated_at')
      .eq('client_id', existingClient?.id || 'none');

    if (modulesError) {
      console.log('   ❌ Error fetching modules:', modulesError.message);
    } else if (modules && modules.length > 0) {
      console.log('   ✅ Existing modules:');
      modules.forEach(m => {
        console.log(`      ${m.module}: ${m.tier} (activated: ${m.activated_at})`);
      });
    } else {
      console.log('   ❌ No modules found');
    }

    // 5. Check existing credits
    console.log('\n5. Checking existing credits...');
    const { data: credits, error: creditsError } = await supabase
      .from('client_credits')
      .select('credit_type, module, used_this_period, period_start')
      .eq('client_id', existingClient?.id || 'none');

    if (creditsError) {
      console.log('   ❌ Error fetching credits:', creditsError.message);
    } else if (credits && credits.length > 0) {
      console.log('   ✅ Existing credits:');
      credits.forEach(c => {
        console.log(`      ${c.credit_type} (${c.module}): ${c.used_this_period} used, period: ${c.period_start}`);
      });
    } else {
      console.log('   ❌ No credits found');
    }

    // 6. Generate SQL with correct IDs
    console.log('\n📝 Generated SQL with correct IDs:');
    console.log('=====================================');
    
    if (existingClient) {
      console.log(`-- Client ID: ${existingClient.id}`);
      console.log(`-- User ID: ${authUser?.id || 'NEEDS_TO_BE_CREATED_IN_AUTH'}`);
      console.log('');
      
      console.log('-- Update existing client');
      console.log(`UPDATE public.clients SET updated_at = NOW() WHERE id = '${existingClient.id}';`);
      console.log('');
      
      if (authUser) {
        console.log('-- Link user to client (or update existing)');
        console.log(`INSERT INTO public.client_users (client_id, user_id, email, full_name, role, created_at) VALUES ('${existingClient.id}', '${authUser.id}', 'djoere@automatrz.nl', 'Djoere Bloemheuvel', 'admin', NOW()) ON CONFLICT (user_id) DO UPDATE SET client_id = EXCLUDED.client_id, email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();`);
        console.log('');
      }
      
      console.log('-- Set unlimited tier for all modules');
      console.log(`INSERT INTO public.client_modules (client_id, module, tier, activated_at, updated_at) VALUES ('${existingClient.id}', 'lead_engine', 'unlimited', NOW(), NOW()), ('${existingClient.id}', 'marketing_engine', 'unlimited', NOW(), NOW()), ('${existingClient.id}', 'sales_engine', 'unlimited', NOW(), NOW()) ON CONFLICT (client_id, module) DO UPDATE SET tier = EXCLUDED.tier, activated_at = EXCLUDED.activated_at, updated_at = EXCLUDED.updated_at;`);
      console.log('');
      
      console.log('-- Set up unlimited credits');
      console.log(`INSERT INTO public.client_credits (client_id, credit_type, module, period_start, reset_interval, used_this_period, created_at, updated_at) VALUES ('${existingClient.id}', 'leads', 'lead_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()), ('${existingClient.id}', 'emails', 'marketing_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()), ('${existingClient.id}', 'linkedin', 'sales_engine', DATE_TRUNC('month', NOW()), 'monthly', 0, NOW(), NOW()) ON CONFLICT (client_id, credit_type, module) DO UPDATE SET period_start = EXCLUDED.period_start, used_this_period = EXCLUDED.used_this_period, updated_at = EXCLUDED.updated_at;`);
      console.log('');
      
      console.log('-- Log the credit setup');
      console.log(`INSERT INTO public.credit_logs (client_id, credit_type, module, change, reason, created_at) VALUES ('${existingClient.id}', 'leads', 'lead_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()), ('${existingClient.id}', 'emails', 'marketing_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW()), ('${existingClient.id}', 'linkedin', 'sales_engine', 999999, 'Unlimited tier setup for djoere@automatrz.nl', NOW());`);
    } else {
      console.log('-- No existing client found, will create new one');
      console.log('-- User ID: ' + (authUser?.id || 'NEEDS_TO_BE_CREATED_IN_AUTH'));
      console.log('');
      
      console.log('-- Create new client');
      console.log(`INSERT INTO public.clients (id, company_name, company_email, company_domain, contactpersoon, created_at, updated_at) VALUES (gen_random_uuid(), 'Automatrz', 'djoere@automatrz.nl', 'automatrz.nl', 'Djoere Bloemheuvel', NOW(), NOW()) RETURNING id;`);
      console.log('');
      
      console.log('-- Then use the returned client_id for the rest of the operations');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getIds(); 