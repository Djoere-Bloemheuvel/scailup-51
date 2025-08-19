// Debug script to check why djoere@scailup.io doesn't get a clientId
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugScailupClient() {
  console.log('🔍 Debugging djoere@scailup.io client access...\n');

  // 1. Check if user exists in auth.users
  console.log('1. Checking auth.users...');
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById('a499bec7-8693-4ca2-a62f-ab65a0cce4c8');
  
  if (authError) {
    console.error('❌ Auth user error:', authError);
  } else {
    console.log('✅ Auth user found:', {
      id: authUser.user.id,
      email: authUser.user.email,
      created_at: authUser.user.created_at
    });
  }

  // 2. Check client_users table
  console.log('\n2. Checking client_users table...');
  const { data: clientUsers, error: clientUsersError } = await supabase
    .from('client_users')
    .select('*')
    .eq('user_id', 'a499bec7-8693-4ca2-a62f-ab65a0cce4c8');

  if (clientUsersError) {
    console.error('❌ Client users error:', clientUsersError);
  } else {
    console.log('✅ Client users found:', clientUsers);
  }

  // 3. Check if client exists
  if (clientUsers && clientUsers.length > 0) {
    const clientId = clientUsers[0].client_id;
    console.log('\n3. Checking client details...');
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId);

    if (clientError) {
      console.error('❌ Client error:', clientError);
    } else {
      console.log('✅ Client found:', client);
    }

    // 4. Check client_modules
    console.log('\n4. Checking client_modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('client_modules')
      .select('*')
      .eq('client_id', clientId);

    if (modulesError) {
      console.error('❌ Modules error:', modulesError);
    } else {
      console.log('✅ Modules found:', modules);
    }

    // 5. Check client_credits
    console.log('\n5. Checking client_credits...');
    const { data: credits, error: creditsError } = await supabase
      .from('client_credits')
      .select('*')
      .eq('client_id', clientId);

    if (creditsError) {
      console.error('❌ Credits error:', creditsError);
    } else {
      console.log('✅ Credits found:', credits);
    }
  }

  // 6. Test the RPC function that the frontend uses
  console.log('\n6. Testing get_current_user_client_id RPC...');
  
  // First, we need to sign in as this user to test the RPC
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'djoere@scailup.io',
    password: 'test123' // This won't work, but let's see what happens
  });

  if (signInError) {
    console.log('⚠️ Sign in failed (expected):', signInError.message);
    console.log('This is expected since we don\'t have the password');
  } else {
    console.log('✅ Sign in successful:', signInData);
    
    // Test the RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_current_user_client_id');
    
    if (rpcError) {
      console.error('❌ RPC error:', rpcError);
    } else {
      console.log('✅ RPC result:', rpcResult);
    }
  }

  // 7. Check if there are any RLS policies blocking access
  console.log('\n7. Checking for potential RLS issues...');
  
  // Try to query client_users directly with the user ID
  const { data: directQuery, error: directError } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', 'a499bec7-8693-4ca2-a62f-ab65a0cce4c8')
    .maybeSingle();

  if (directError) {
    console.error('❌ Direct query error:', directError);
  } else {
    console.log('✅ Direct query result:', directQuery);
  }

  console.log('\n🎯 SUMMARY:');
  console.log('- User exists in auth.users: ✅');
  console.log('- User has client_users record:', clientUsers && clientUsers.length > 0 ? '✅' : '❌');
  
  if (clientUsers && clientUsers.length > 0) {
    console.log('- Client exists:', client && client.length > 0 ? '✅' : '❌');
    console.log('- Has modules:', modules && modules.length > 0 ? '✅' : '❌');
    console.log('- Has credits:', credits && credits.length > 0 ? '✅' : '❌');
  }
  
  console.log('\n💡 RECOMMENDATION:');
  if (!clientUsers || clientUsers.length === 0) {
    console.log('Run the setup-both-unlimited-tier.sql script to create the missing client_user link');
  } else {
    console.log('The user should have access. Check if there are RLS policies blocking access.');
  }
}

debugScailupClient().catch(console.error); 