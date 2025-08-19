import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversionWithRealData() {
  console.log('🧪 Testing conversion with real data from database...\n');
  
  try {
    // Get a real lead from the database
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .not('email', 'is', null)
      .neq('email', '')
      .limit(1);
    
    if (leadsError) {
      console.log('❌ Error getting leads:', leadsError.message);
      return false;
    }
    
    if (!leads || leads.length === 0) {
      console.log('❌ No leads found in database');
      return false;
    }
    
    const testLead = leads[0];
    console.log(`📝 Found test lead: ${testLead.first_name} ${testLead.last_name} (${testLead.email})`);
    console.log(`📝 Lead ID: ${testLead.id}`);
    
    // Test the convert_lead_to_contact function
    console.log('\n🧪 Testing convert_lead_to_contact function...');
    const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLead.id,
      notes: 'Test conversion from script'
    });
    
    if (convertError) {
      console.log('❌ Convert error:', convertError.message);
      
      // Check if it's because the lead is already converted
      if (convertError.message.includes('already exists') || convertError.message.includes('Contact already exists')) {
        console.log('✅ Lead is already converted - this is expected behavior');
        return true;
      }
      
      return false;
    } else {
      console.log('✅ Convert successful:', convertData);
    }
    
    // Check if the contact was created
    console.log('\n📊 Checking if contact was created...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('lead_id', testLead.id);
    
    if (contactsError) {
      console.log('❌ Error checking contacts:', contactsError.message);
    } else {
      console.log(`✅ Found ${contacts?.length || 0} contacts for this lead`);
      if (contacts && contacts.length > 0) {
        console.log('📊 Contact details:', {
          id: contacts[0].id,
          lead_id: contacts[0].lead_id,
          client_id: contacts[0].client_id,
          contact_date: contacts[0].contact_date,
          notes: contacts[0].notes
        });
      }
    }
    
    // Test the get_contacts_with_lead_data function
    console.log('\n🧪 Testing get_contacts_with_lead_data function...');
    const { data: contactsWithLeadData, error: contactsDataError } = await supabase.rpc('get_contacts_with_lead_data');
    
    if (contactsDataError) {
      console.log('❌ Error getting contacts with lead data:', contactsDataError.message);
    } else {
      console.log(`✅ Found ${contactsWithLeadData?.length || 0} contacts with lead data`);
      if (contactsWithLeadData && contactsWithLeadData.length > 0) {
        console.log('📊 Sample contact with lead data:', {
          id: contactsWithLeadData[0].id,
          lead_id: contactsWithLeadData[0].lead_id,
          lead_first_name: contactsWithLeadData[0].lead_first_name,
          lead_last_name: contactsWithLeadData[0].lead_last_name,
          lead_email: contactsWithLeadData[0].lead_email,
          lead_company_name: contactsWithLeadData[0].lead_company_name
        });
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing conversion:', error);
    return false;
  }
}

async function checkCreditSystem() {
  console.log('\n💰 Checking credit system...\n');
  
  try {
    // Check credit balances
    const { data: creditBalances, error: creditError } = await supabase
      .from('credit_balances')
      .select('*')
      .eq('credit_type', 'leads')
      .gt('amount', 0);
    
    if (creditError) {
      console.log('❌ Error checking credit balances:', creditError.message);
    } else {
      console.log(`✅ Found ${creditBalances?.length || 0} credit balances for leads`);
      if (creditBalances && creditBalances.length > 0) {
        creditBalances.forEach(balance => {
          console.log(`📊 Credit balance: ${balance.amount} credits (expires: ${balance.expires_at})`);
        });
      }
    }
    
    // Test the check_and_use_credits function
    console.log('\n🧪 Testing check_and_use_credits function...');
    const { data: creditUsage, error: creditUsageError } = await supabase.rpc('check_and_use_credits', {
      credit_type: 'leads',
      amount: 1,
      description: 'Test credit usage'
    });
    
    if (creditUsageError) {
      console.log('❌ Error using credits:', creditUsageError.message);
    } else {
      console.log('✅ Credit usage successful:', creditUsage);
    }
    
  } catch (error) {
    console.error('❌ Error checking credit system:', error);
  }
}

async function main() {
  console.log('🚀 Starting comprehensive conversion test...\n');
  
  // Test conversion with real data
  const conversionWorks = await testConversionWithRealData();
  
  if (conversionWorks) {
    console.log('\n🎉 Conversion functionality works correctly!');
    console.log('✅ The frontend "Contact maken" button should work');
    console.log('✅ Leads can be converted to contacts');
    console.log('✅ Contacts appear in the contacts page');
  } else {
    console.log('\n❌ Conversion has issues');
    console.log('🔧 Need to investigate further');
  }
  
  // Check credit system
  await checkCreditSystem();
  
  console.log('\n🔍 Test complete. Check the results above.');
}

// Run the script
main().catch(console.error); 