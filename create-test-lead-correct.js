import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestLead() {
  console.log('🔧 Creating test lead with correct structure...\n');
  
  try {
    // Get the client ID from the existing client
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ No clients found');
      return false;
    }
    
    const clientId = clients[0].id;
    console.log(`✅ Using client ID: ${clientId}`);
    
    // Create test lead with correct columns based on contacts structure
    const testLead = {
      email: 'john.doe@testcompany.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+31611111111',
      job_title: 'CEO',
      industry: 'Technology',
      website: 'https://testcompany.com',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      notes: 'Test lead for conversion testing',
      status: 'active',
      tags: ['test', 'conversion'],
      client_id: clientId,
      lifecycle_stage: 'lead',
      lead_score: 85,
      contact_source: 'linkedin',
      preferred_contact_method: 'email',
      is_unsubscribed: false,
      data_quality_score: 95
    };
    
    console.log('📝 Creating lead with data:', testLead);
    
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      
      // Try with minimal required fields
      console.log('📝 Trying with minimal fields...');
      const minimalLead = {
        email: 'jane.smith@testcompany2.com',
        first_name: 'Jane',
        last_name: 'Smith',
        client_id: clientId,
        status: 'active'
      };
      
      const { data: newLead2, error: insertError2 } = await supabase
        .from('leads')
        .insert(minimalLead)
        .select()
        .single();
      
      if (insertError2) {
        console.log('❌ Minimal insert error:', insertError2.message);
        return false;
      } else {
        console.log('✅ Lead created successfully with minimal data:', newLead2);
        return newLead2;
      }
    } else {
      console.log('✅ Lead created successfully:', newLead);
      return newLead;
    }
    
  } catch (error) {
    console.error('❌ Error creating lead:', error);
    return false;
  }
}

async function testConversionWithNewLead(leadId) {
  console.log('\n🧪 Testing conversion with new lead...\n');
  
  try {
    console.log(`📝 Testing conversion with lead ID: ${leadId}`);
    
    // Test individual conversion
    const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: leadId,
      notes: 'Test conversion from correct structure'
    });
    
    if (convertError) {
      console.log('❌ Convert error:', convertError.message);
      console.log('❌ Error details:', convertError);
      return false;
    } else {
      console.log('✅ Convert successful:', convertData);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error testing conversion:', error);
    return false;
  }
}

async function checkLeadsAfterConversion() {
  console.log('\n📊 Checking leads and contacts after conversion...\n');
  
  try {
    // Check leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) {
      console.log('❌ Error getting leads:', leadsError.message);
    } else {
      console.log(`✅ Found ${leads?.length || 0} leads`);
    }
    
    // Check contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*');
    
    if (contactsError) {
      console.log('❌ Error getting contacts:', contactsError.message);
    } else {
      console.log(`✅ Found ${contacts?.length || 0} contacts`);
      if (contacts && contacts.length > 0) {
        console.log('📊 Latest contact:', {
          id: contacts[contacts.length - 1].id,
          email: contacts[contacts.length - 1].email,
          first_name: contacts[contacts.length - 1].first_name,
          last_name: contacts[contacts.length - 1].last_name,
          lead_id: contacts[contacts.length - 1].lead_id
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

async function main() {
  console.log('🚀 Starting test lead creation and conversion...\n');
  
  // Create test lead
  const newLead = await createTestLead();
  
  if (newLead) {
    console.log(`\n✅ Test lead created: ${newLead.first_name} ${newLead.last_name} (${newLead.email})`);
    
    // Test conversion
    const conversionWorks = await testConversionWithNewLead(newLead.id);
    
    if (conversionWorks) {
      console.log('\n🎉 Conversion works correctly!');
      console.log('✅ The frontend should work now');
      console.log('✅ Try refreshing the page and testing the conversion buttons');
    } else {
      console.log('\n❌ Conversion still fails');
      console.log('🔧 This suggests an issue with the conversion function itself');
    }
    
    // Check data after conversion
    await checkLeadsAfterConversion();
    
  } else {
    console.log('\n❌ Could not create test lead');
    console.log('🔧 Need to investigate the leads table structure further');
  }
}

// Run the script
main().catch(console.error); 