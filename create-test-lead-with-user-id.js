import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestLead() {
  console.log('🔧 Creating test lead with correct user_id structure...\n');
  
  try {
    // Get the user ID from the existing client
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ No clients found');
      return false;
    }
    
    const userId = clients[0].user_id;
    console.log(`✅ Using user ID: ${userId}`);
    
    // Create test lead with correct columns based on the actual leads table structure
    const testLead = {
      user_id: userId,
      first_name: 'John',
      last_name: 'Doe',
      job_title: 'CEO',
      company: 'Test Company 1',
      email: 'john.doe@testcompany.com',
      email_status: 'verified',
      phone: '+31611111111',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      industry: 'Technology',
      country: 'Netherlands',
      region: 'Noord-Holland',
      city: 'Amsterdam',
      company_size: '51_200',
      management_level: 'c_level',
      lead_score: 85,
      buying_intent_score: 70,
      tags: ['B2B', 'SaaS', 'test'],
      technologies: ['Salesforce', 'HubSpot'],
      company_tags: ['Enterprise', 'Tech'],
      in_active_campaign: false
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
        user_id: userId,
        first_name: 'Jane',
        last_name: 'Smith',
        company: 'Test Company 2',
        email: 'jane.smith@testcompany2.com'
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
      if (leads && leads.length > 0) {
        console.log('📊 Sample lead:', {
          id: leads[0].id,
          first_name: leads[0].first_name,
          last_name: leads[0].last_name,
          email: leads[0].email,
          company: leads[0].company
        });
      }
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
          lead_id: contacts[contacts.length - 1].lead_id,
          client_id: contacts[contacts.length - 1].client_id
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

async function main() {
  console.log('🚀 Starting test lead creation with correct structure...\n');
  
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
    console.log('🔧 Need to investigate further');
  }
}

// Run the script
main().catch(console.error); 