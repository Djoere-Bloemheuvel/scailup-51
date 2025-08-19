import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseData() {
  console.log('🔍 Checking database data...\n');
  
  try {
    // Check leads
    console.log('📝 Checking leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);
    
    if (leadsError) {
      console.log('❌ Error getting leads:', leadsError.message);
    } else {
      console.log(`✅ Found ${leads?.length || 0} leads`);
      if (leads && leads.length > 0) {
        console.log('📊 Sample lead:', {
          id: leads[0].id,
          email: leads[0].email,
          first_name: leads[0].first_name,
          last_name: leads[0].last_name,
          company: leads[0].company
        });
      }
    }
    
    // Check contacts
    console.log('\n📝 Checking contacts table...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5);
    
    if (contactsError) {
      console.log('❌ Error getting contacts:', contactsError.message);
    } else {
      console.log(`✅ Found ${contacts?.length || 0} contacts`);
      if (contacts && contacts.length > 0) {
        console.log('📊 Sample contact:', {
          id: contacts[0].id,
          email: contacts[0].email,
          first_name: contacts[0].first_name,
          last_name: contacts[0].last_name,
          company: contacts[0].company
        });
      }
    }
    
    // Check clients
    console.log('\n📝 Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.log('❌ Error getting clients:', clientsError.message);
    } else {
      console.log(`✅ Found ${clients?.length || 0} clients`);
      if (clients && clients.length > 0) {
        console.log('📊 Sample client:', {
          id: clients[0].id,
          name: clients[0].name,
          email: clients[0].email
        });
      }
    }
    
    // Check users
    console.log('\n📝 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log('📊 Sample user:', {
          id: users[0].id,
          email: users[0].email,
          full_name: users[0].full_name
        });
      }
    }
    
    return {
      leads: leads?.length || 0,
      contacts: contacts?.length || 0,
      clients: clients?.length || 0,
      users: users?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    return null;
  }
}

async function createTestData() {
  console.log('\n🔧 Creating test data...\n');
  
  try {
    // First, check if we have a client to work with
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    let clientId;
    
    if (clientsError || !clients || clients.length === 0) {
      console.log('📝 Creating test client...');
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert({
          name: 'Test Client',
          email: 'test@example.com',
          phone: '+31612345678',
          website: 'https://example.com',
          industry: 'Technology',
          company_size: '10-50',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (newClientError) {
        console.log('❌ Error creating client:', newClientError.message);
        return false;
      }
      
      clientId = newClient.id;
      console.log('✅ Created test client:', clientId);
    } else {
      clientId = clients[0].id;
      console.log('✅ Using existing client:', clientId);
    }
    
    // Create test leads
    console.log('📝 Creating test leads...');
    const testLeads = [
      {
        email: 'john.doe@testcompany.com',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Company 1',
        job_title: 'CEO',
        phone: '+31611111111',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        industry: 'Technology',
        company_size: '10-50',
        location: 'Amsterdam',
        client_id: clientId,
        created_at: new Date().toISOString()
      },
      {
        email: 'jane.smith@testcompany2.com',
        first_name: 'Jane',
        last_name: 'Smith',
        company: 'Test Company 2',
        job_title: 'CTO',
        phone: '+31622222222',
        linkedin_url: 'https://linkedin.com/in/janesmith',
        industry: 'Finance',
        company_size: '50-200',
        location: 'Rotterdam',
        client_id: clientId,
        created_at: new Date().toISOString()
      }
    ];
    
    const { data: newLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(testLeads)
      .select();
    
    if (leadsError) {
      console.log('❌ Error creating leads:', leadsError.message);
      return false;
    }
    
    console.log('✅ Created test leads:', newLeads?.length || 0);
    newLeads?.forEach(lead => {
      console.log(`  - ${lead.first_name} ${lead.last_name} (${lead.email})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return false;
  }
}

async function testConversionWithRealData() {
  console.log('\n🧪 Testing conversion with real data...\n');
  
  try {
    // Get a real lead
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (leadsError || !leads || leads.length === 0) {
      console.log('❌ No leads available for testing');
      return false;
    }
    
    const testLead = leads[0];
    console.log(`📝 Testing conversion with lead: ${testLead.first_name} ${testLead.last_name} (${testLead.email})`);
    
    // Test individual conversion
    console.log('📝 Testing individual conversion...');
    const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLead.id,
      notes: 'Test conversion from debug script'
    });
    
    if (convertError) {
      console.log('❌ Individual convert error:', convertError.message);
      console.log('❌ Error details:', convertError);
      return false;
    } else {
      console.log('✅ Individual convert successful:', convertData);
    }
    
    // Test bulk conversion with remaining leads
    console.log('\n📝 Testing bulk conversion...');
    const remainingLeads = leads.slice(1);
    if (remainingLeads.length > 0) {
      const leadIds = remainingLeads.map(lead => lead.id);
      console.log(`🔍 Converting ${leadIds.length} leads: ${leadIds.join(', ')}`);
      
      const { data: bulkData, error: bulkError } = await supabase.rpc('bulk_convert_leads_to_contacts', {
        lead_ids: leadIds,
        notes: 'Test bulk conversion from debug script'
      });
      
      if (bulkError) {
        console.log('❌ Bulk convert error:', bulkError.message);
        console.log('❌ Error details:', bulkError);
        return false;
      } else {
        console.log('✅ Bulk convert successful:', bulkData);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing conversion:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database data check and test...\n');
  
  // Check current data
  const dataCounts = await checkDatabaseData();
  
  if (!dataCounts) {
    console.log('❌ Could not check database data');
    return;
  }
  
  // If no leads, create test data
  if (dataCounts.leads === 0) {
    console.log('\n⚠️ No leads found. Creating test data...');
    const created = await createTestData();
    
    if (!created) {
      console.log('❌ Failed to create test data');
      return;
    }
  }
  
  // Test conversion with real data
  const conversionWorks = await testConversionWithRealData();
  
  if (conversionWorks) {
    console.log('\n🎉 Conversion functions work correctly with real data!');
    console.log('✅ The frontend should work now');
    console.log('✅ Try refreshing the page and testing the conversion buttons');
  } else {
    console.log('\n❌ Conversion still has issues');
    console.log('🔧 This suggests a deeper problem with the functions or permissions');
  }
}

// Run the script
main().catch(console.error); 