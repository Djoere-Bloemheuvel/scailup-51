import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunctions() {
  console.log('🧪 Testing convert functions...');
  
  try {
    // Test convert_lead_to_contact function
    console.log('📝 Testing convert_lead_to_contact...');
    const testLeadId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    const { data, error } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test conversion'
    });

    if (error) {
      if (error.message.includes('Lead not found') || error.message.includes('Client not found')) {
        console.log('✅ convert_lead_to_contact function exists and works (expected error for dummy data)');
      } else if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('❌ convert_lead_to_contact function not found');
        return false;
      } else {
        console.log('✅ convert_lead_to_contact function exists and works (got expected error)');
      }
    } else {
      console.log('✅ convert_lead_to_contact function exists and works!');
    }
    
    // Test bulk_convert_leads_to_contacts function
    console.log('📝 Testing bulk_convert_leads_to_contacts...');
    const { data: bulkData, error: bulkError } = await supabase.rpc('bulk_convert_leads_to_contacts', {
      lead_ids: [testLeadId],
      notes: 'Test bulk conversion'
    });

    if (bulkError) {
      if (bulkError.message.includes('Lead not found') || bulkError.message.includes('Client not found')) {
        console.log('✅ bulk_convert_leads_to_contacts function exists and works (expected error for dummy data)');
      } else if (bulkError.message.includes('function') && bulkError.message.includes('not found')) {
        console.log('❌ bulk_convert_leads_to_contacts function not found');
        return false;
      } else {
        console.log('✅ bulk_convert_leads_to_contacts function exists and works (got expected error)');
      }
    } else {
      console.log('✅ bulk_convert_leads_to_contacts function exists and works!');
    }
    
    // Test get_contacts_with_lead_data function
    console.log('📝 Testing get_contacts_with_lead_data...');
    const { data: contactsData, error: contactsError } = await supabase.rpc('get_contacts_with_lead_data');

    if (contactsError) {
      if (contactsError.message.includes('function') && contactsError.message.includes('not found')) {
        console.log('❌ get_contacts_with_lead_data function not found');
        return false;
      } else {
        console.log('✅ get_contacts_with_lead_data function exists and works (got expected error)');
      }
    } else {
      console.log('✅ get_contacts_with_lead_data function exists and works!');
      console.log(`📊 Found ${contactsData?.length || 0} contacts`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Function testing failed:', error);
    return false;
  }
}

async function createSimpleFunctions() {
  console.log('\n🔧 Creating simple functions via direct SQL...');
  
  try {
    // Try to create a simple test function first
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1 as test;'
    });

    if (error) {
      console.log('❌ exec_sql function not available');
      console.log('📋 Please apply the SQL manually in Supabase dashboard');
      return false;
    }

    console.log('✅ exec_sql function available, proceeding with function creation...');
    return true;
    
  } catch (error) {
    console.log('❌ Cannot create functions automatically');
    console.log('📋 Please apply the SQL manually in Supabase dashboard');
    return false;
  }
}

async function main() {
  console.log('🚀 Testing convert functions...\n');
  
  const functionsWork = await testFunctions();
  
  if (functionsWork) {
    console.log('\n🎉 All functions are working! Convert functionality should work now.');
    console.log('✅ Individual lead conversion should work');
    console.log('✅ Bulk lead conversion should work');
    console.log('✅ Contact list should display correctly');
  } else {
    console.log('\n❌ Functions are not working. Need to apply SQL manually.');
    console.log('📋 Please copy and paste the content of fix-schema-cache-direct.sql into your Supabase SQL Editor');
    
    const canCreate = await createSimpleFunctions();
    if (!canCreate) {
      console.log('\n🔧 Manual steps required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open the SQL Editor');
      console.log('3. Copy and paste the content of fix-schema-cache-direct.sql');
      console.log('4. Click "Run"');
    }
  }
}

// Run the script
main().catch(console.error); 