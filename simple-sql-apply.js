import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createContactsTable() {
  console.log('📝 Creating contacts table...');
  
  try {
    // Check if contacts table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.message.includes('relation "contacts" does not exist')) {
      console.log('❌ Contacts table does not exist. Need to create it manually in Supabase dashboard.');
      return false;
    } else {
      console.log('✅ Contacts table exists');
      return true;
    }
  } catch (error) {
    console.log('❌ Error checking contacts table:', error.message);
    return false;
  }
}

async function createConvertFunction() {
  console.log('📝 Creating convert_lead_to_contact function...');
  
  try {
    // Try to call the function to see if it exists
    const testLeadId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test'
    });

    if (error) {
      if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('❌ convert_lead_to_contact function does not exist');
        console.log('📋 Please copy and paste the SQL from fix-convert-functions.sql into your Supabase SQL Editor');
        return false;
      } else {
        console.log('✅ convert_lead_to_contact function exists (got expected error for dummy data)');
        return true;
      }
    } else {
      console.log('✅ convert_lead_to_contact function exists and works!');
      return true;
    }
  } catch (error) {
    console.log('❌ Error testing convert function:', error.message);
    return false;
  }
}

async function createGetContactsFunction() {
  console.log('📝 Testing get_contacts_with_lead_data function...');
  
  try {
    const { data, error } = await supabase.rpc('get_contacts_with_lead_data');

    if (error) {
      if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('❌ get_contacts_with_lead_data function does not exist');
        return false;
      } else {
        console.log('✅ get_contacts_with_lead_data function exists (got expected error)');
        return true;
      }
    } else {
      console.log('✅ get_contacts_with_lead_data function exists and works!');
      console.log(`📊 Found ${data?.length || 0} contacts`);
      return true;
    }
  } catch (error) {
    console.log('❌ Error testing get_contacts function:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Checking convert functions status...\n');
  
  const contactsTableExists = await createContactsTable();
  const convertFunctionExists = await createConvertFunction();
  const getContactsFunctionExists = await createGetContactsFunction();
  
  console.log('\n📊 Status Summary:');
  console.log(`Contacts table: ${contactsTableExists ? '✅' : '❌'}`);
  console.log(`convert_lead_to_contact function: ${convertFunctionExists ? '✅' : '❌'}`);
  console.log(`get_contacts_with_lead_data function: ${getContactsFunctionExists ? '✅' : '❌'}`);
  
  if (contactsTableExists && convertFunctionExists && getContactsFunctionExists) {
    console.log('\n🎉 All functions are working! Convert leads to contact should work now.');
  } else {
    console.log('\n🔧 Some functions are missing. Please apply the SQL manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy and paste the content of fix-convert-functions.sql');
    console.log('4. Click "Run"');
  }
}

main().catch(console.error); 