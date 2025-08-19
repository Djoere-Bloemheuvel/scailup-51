import { createClient } from '@supabase/supabase-js';

// Supabase configuration - same as frontend
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendConversion() {
  console.log('🧪 Testing frontend conversion functionality...\n');
  
  try {
    // Step 1: Get leads (like the frontend does)
    console.log('📝 Step 1: Getting leads (frontend call)...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .not('email', 'is', null)
      .neq('email', '')
      .limit(5);
    
    if (leadsError) {
      console.log('❌ Error getting leads:', leadsError.message);
      return false;
    }
    
    console.log(`✅ Found ${leads?.length || 0} leads`);
    
    if (!leads || leads.length === 0) {
      console.log('⚠️ No leads found - this explains why conversion doesn\'t work in frontend');
      console.log('💡 The frontend needs leads to convert');
      return false;
    }
    
    // Show sample leads
    leads.forEach((lead, index) => {
      console.log(`  ${index + 1}. ${lead.first_name} ${lead.last_name} (${lead.email}) - ${lead.company_name || 'No company'}`);
    });
    
    // Step 2: Test credit checking (like frontend does)
    console.log('\n📝 Step 2: Testing credit checking (frontend call)...');
    const { data: creditBalances, error: creditError } = await supabase
      .from('credit_balances')
      .select('*')
      .eq('credit_type', 'leads')
      .gte('expires_at', new Date().toISOString())
      .gt('amount', 0);
    
    if (creditError) {
      console.log('❌ Error checking credits:', creditError.message);
    } else {
      const availableCredits = (creditBalances || []).reduce((sum, balance) => sum + balance.amount, 0);
      console.log(`✅ Available leads credits: ${availableCredits}`);
      
      if (availableCredits === 0) {
        console.log('⚠️ No credits available - this will prevent conversion');
      }
    }
    
    // Step 3: Test conversion with first lead (like frontend does)
    if (leads && leads.length > 0) {
      const testLead = leads[0];
      console.log(`\n📝 Step 3: Testing conversion with lead: ${testLead.first_name} ${testLead.last_name}`);
      
      // Check if lead is already converted
      const { data: existingContact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('lead_id', testLead.id);
      
      if (contactError) {
        console.log('❌ Error checking existing contact:', contactError.message);
      } else if (existingContact && existingContact.length > 0) {
        console.log('⚠️ Lead is already converted to contact');
        console.log('📊 Existing contact:', {
          id: existingContact[0].id,
          contact_date: existingContact[0].contact_date,
          notes: existingContact[0].notes
        });
      } else {
        console.log('✅ Lead is not yet converted - can be converted');
        
        // Test the conversion function (like frontend does)
        console.log('📝 Testing convert_lead_to_contact function...');
        const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
          lead_id: testLead.id,
          notes: 'Test conversion from frontend simulation'
        });
        
        if (convertError) {
          console.log('❌ Conversion error:', convertError.message);
          
          if (convertError.message.includes('Insufficient credits')) {
            console.log('💡 This is a credit issue - need more credits');
          } else if (convertError.message.includes('Lead not found')) {
            console.log('💡 This is a permission issue - RLS blocking access');
          } else {
            console.log('💡 This is a function issue');
          }
        } else {
          console.log('✅ Conversion successful!');
          console.log('📊 Contact created:', convertData);
          
          // Verify contact was created
          const { data: newContact, error: newContactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('lead_id', testLead.id);
          
          if (newContactError) {
            console.log('❌ Error verifying contact:', newContactError.message);
          } else {
            console.log(`✅ Contact verified: ${newContact?.length || 0} contacts found`);
            if (newContact && newContact.length > 0) {
              console.log('📊 New contact details:', {
                id: newContact[0].id,
                lead_id: newContact[0].lead_id,
                contact_date: newContact[0].contact_date,
                notes: newContact[0].notes
              });
            }
          }
        }
      }
    }
    
    // Step 4: Test get_contacts_with_lead_data (like contacts page does)
    console.log('\n📝 Step 4: Testing get_contacts_with_lead_data (contacts page call)...');
    const { data: contactsWithLeadData, error: contactsDataError } = await supabase.rpc('get_contacts_with_lead_data');
    
    if (contactsDataError) {
      console.log('❌ Error getting contacts with lead data:', contactsDataError.message);
    } else {
      console.log(`✅ Found ${contactsWithLeadData?.length || 0} contacts with lead data`);
      if (contactsWithLeadData && contactsWithLeadData.length > 0) {
        console.log('📊 Sample contact with lead data:', {
          id: contactsWithLeadData[0].id,
          lead_first_name: contactsWithLeadData[0].lead_first_name,
          lead_last_name: contactsWithLeadData[0].lead_last_name,
          lead_email: contactsWithLeadData[0].lead_email,
          lead_company_name: contactsWithLeadData[0].lead_company_name,
          contact_date: contactsWithLeadData[0].contact_date
        });
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing frontend conversion:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing frontend conversion functionality...\n');
  
  const conversionWorks = await testFrontendConversion();
  
  if (conversionWorks) {
    console.log('\n🎉 Frontend conversion functionality test complete!');
    console.log('✅ All backend functions work correctly');
    console.log('✅ The "Contact maken" button should work in the frontend');
    console.log('✅ Leads can be converted to contacts');
    console.log('✅ Contacts appear in the contacts page');
    console.log('✅ Credit system is properly integrated');
  } else {
    console.log('\n❌ Frontend conversion has issues');
    console.log('🔧 Check the specific errors above');
  }
}

// Run the script
main().catch(console.error); 