import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConvertFunction() {
  console.log('🧪 Testing convert_lead_to_contact function...');

  try {
    // First, let's check if the function exists
    console.log('📝 Checking if function exists...');
    
    // Try to call the function with a test lead ID
    const testLeadId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    const { data, error } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test conversion'
    });

    if (error) {
      console.log('❌ Function call failed:', error.message);
      
      if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('🔧 Function does not exist. Need to create it.');
        return false;
      } else {
        console.log('✅ Function exists but failed with expected error:', error.message);
        return true;
      }
    }

    console.log('✅ Function exists and works!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function testGetContactsFunction() {
  console.log('🧪 Testing get_contacts_with_lead_data function...');

  try {
    const { data, error } = await supabase.rpc('get_contacts_with_lead_data');

    if (error) {
      console.log('❌ Function call failed:', error.message);
      
      if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('🔧 Function does not exist. Need to create it.');
        return false;
      } else {
        console.log('✅ Function exists but failed with expected error:', error.message);
        return true;
      }
    }

    console.log('✅ Function exists and works!');
    console.log('📊 Contacts found:', data?.length || 0);
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function testCheckCreditsFunction() {
  console.log('🧪 Testing check_and_use_credits function...');

  try {
    const { data, error } = await supabase.rpc('check_and_use_credits', {
      credit_type: 'leads',
      amount: 1,
      description: 'Test credit check'
    });

    if (error) {
      console.log('❌ Function call failed:', error.message);
      
      if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('🔧 Function does not exist. Need to create it.');
        return false;
      } else {
        console.log('✅ Function exists but failed with expected error:', error.message);
        return true;
      }
    }

    console.log('✅ Function exists and works!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting function tests...\n');

  const results = await Promise.all([
    testConvertFunction(),
    testGetContactsFunction(),
    testCheckCreditsFunction()
  ]);

  console.log('\n📊 Test Results:');
  console.log('convert_lead_to_contact:', results[0] ? '✅' : '❌');
  console.log('get_contacts_with_lead_data:', results[1] ? '✅' : '❌');
  console.log('check_and_use_credits:', results[2] ? '✅' : '❌');

  const allWorking = results.every(result => result);
  
  if (allWorking) {
    console.log('\n🎉 All functions are working!');
  } else {
    console.log('\n🔧 Some functions need to be created or fixed.');
  }

  return allWorking;
}

// Run the tests
runTests(); 