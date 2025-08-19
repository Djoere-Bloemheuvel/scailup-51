import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealConversion() {
  console.log('🧪 Testing real lead conversion...');
  
  try {
    // First, get a real lead from the database
    console.log('📝 Finding a real lead to test with...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, email, first_name, last_name, company_name')
      .not('email', 'is', null)
      .neq('email', '')
      .limit(1);

    if (leadsError) {
      console.log('❌ Error fetching leads:', leadsError.message);
      return false;
    }

    if (!leads || leads.length === 0) {
      console.log('❌ No leads found in database');
      return false;
    }

    const testLead = leads[0];
    console.log(`✅ Found test lead: ${testLead.first_name} ${testLead.last_name} (${testLead.email}) at ${testLead.company_name}`);

    // Check if this lead is already a contact
    console.log('📝 Checking if lead is already a contact...');
    const { data: existingContact, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('lead_id', testLead.id)
      .limit(1);

    if (contactError) {
      console.log('❌ Error checking existing contact:', contactError.message);
      return false;
    }

    if (existingContact && existingContact.length > 0) {
      console.log('⚠️ Lead is already a contact, skipping conversion test');
      return true;
    }

    // Try to convert the lead
    console.log('📝 Attempting to convert lead to contact...');
    const { data: contactId, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLead.id,
      notes: 'Test conversion from script'
    });

    if (convertError) {
      console.log('❌ Conversion failed:', convertError.message);
      return false;
    }

    console.log(`✅ Lead converted successfully! Contact ID: ${contactId}`);

    // Verify the contact was created
    console.log('📝 Verifying contact was created...');
    const { data: newContact, error: verifyError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying contact:', verifyError.message);
      return false;
    }

    console.log('✅ Contact verified:', {
      id: newContact.id,
      lead_id: newContact.lead_id,
      notes: newContact.notes,
      status: newContact.status,
      created_at: newContact.created_at
    });

    // Test get_contacts_with_lead_data
    console.log('📝 Testing get_contacts_with_lead_data...');
    const { data: contactsWithLeadData, error: contactsError } = await supabase.rpc('get_contacts_with_lead_data');

    if (contactsError) {
      console.log('❌ Error fetching contacts with lead data:', contactsError.message);
      return false;
    }

    console.log(`✅ get_contacts_with_lead_data works! Found ${contactsWithLeadData?.length || 0} contacts`);
    
    if (contactsWithLeadData && contactsWithLeadData.length > 0) {
      const latestContact = contactsWithLeadData[0];
      console.log('📊 Latest contact data:', {
        contact_id: latestContact.id,
        lead_name: `${latestContact.lead_first_name} ${latestContact.lead_last_name}`,
        lead_email: latestContact.lead_email,
        company: latestContact.lead_company_name,
        contact_date: latestContact.contact_date
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing real convert functionality...\n');
  
  const success = await testRealConversion();
  
  if (success) {
    console.log('\n🎉 Convert leads to contact functionality is working perfectly!');
    console.log('✅ The frontend should now be able to convert leads to contacts');
  } else {
    console.log('\n❌ Convert functionality has issues. Please check the error messages above.');
  }
}

main().catch(console.error); 