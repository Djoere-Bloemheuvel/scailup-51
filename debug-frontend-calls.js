import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using the same config as frontend
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendCalls() {
  console.log('🔍 Debugging frontend calls...\n');
  
  try {
    // Test 1: Get leads (like the frontend does)
    console.log('📝 Test 1: Getting leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (leadsError) {
      console.log('❌ Error getting leads:', leadsError.message);
    } else {
      console.log('✅ Leads retrieved successfully');
      console.log(`📊 Found ${leads?.length || 0} leads`);
    }
    
    // Test 2: Try to convert a lead (exact same call as frontend)
    console.log('\n📝 Test 2: Trying to convert a lead...');
    if (leads && leads.length > 0) {
      const testLeadId = leads[0].id;
      console.log(`🔍 Using lead ID: ${testLeadId}`);
      
      const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
        lead_id: testLeadId,
        notes: 'Test conversion from debug script'
      });
      
      if (convertError) {
        console.log('❌ Convert error:', convertError.message);
        console.log('❌ Error details:', convertError);
      } else {
        console.log('✅ Convert successful:', convertData);
      }
    } else {
      console.log('⚠️ No leads found to test conversion');
    }
    
    // Test 3: Try bulk conversion
    console.log('\n📝 Test 3: Trying bulk conversion...');
    if (leads && leads.length > 0) {
      const leadIds = leads.slice(0, 2).map(lead => lead.id);
      console.log(`🔍 Using lead IDs: ${leadIds.join(', ')}`);
      
      const { data: bulkData, error: bulkError } = await supabase.rpc('bulk_convert_leads_to_contacts', {
        lead_ids: leadIds,
        notes: 'Test bulk conversion from debug script'
      });
      
      if (bulkError) {
        console.log('❌ Bulk convert error:', bulkError.message);
        console.log('❌ Error details:', bulkError);
      } else {
        console.log('✅ Bulk convert successful:', bulkData);
      }
    }
    
    // Test 4: Check if we can see the function in the schema
    console.log('\n📝 Test 4: Checking function visibility...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_type', 'FUNCTION')
      .ilike('routine_name', '%convert%');
    
    if (functionsError) {
      console.log('❌ Cannot query information_schema:', functionsError.message);
    } else {
      console.log('✅ Available convert functions:');
      functions?.forEach(func => console.log(`  - ${func.routine_name}`));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function checkUserAuth() {
  console.log('\n🔐 Checking authentication...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
      return false;
    }
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
      return true;
    } else {
      console.log('⚠️ No user authenticated');
      return false;
    }
  } catch (error) {
    console.log('❌ Auth check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting frontend call debugging...\n');
  
  const isAuth = await checkUserAuth();
  
  if (!isAuth) {
    console.log('⚠️ Not authenticated - some calls may fail due to RLS policies');
  }
  
  await debugFrontendCalls();
  
  console.log('\n🔍 Debugging complete. Check the errors above to see what the frontend is experiencing.');
}

// Run the script
main().catch(console.error); 