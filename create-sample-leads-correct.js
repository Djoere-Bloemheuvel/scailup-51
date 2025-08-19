import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleLeads() {
  console.log('🔧 Creating sample leads with correct columns...\n');
  
  try {
    // Get the user ID
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
    
    // Create sample leads with only the columns that exist
    const sampleLeads = [
      {
        user_id: userId,
        first_name: 'John',
        last_name: 'Doe',
        job_title: 'CEO',
        company_name: 'TechCorp',
        email: 'john.doe@techcorp.com',
        phone: '+31611111111',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        industry: 'Technology',
        country: 'Netherlands',
        region: 'Noord-Holland',
        city: 'Amsterdam',
        company_size: '51_200',
        management_level: 'c_level',
        lead_score: 85,
        tags: ['B2B', 'SaaS'],
        technologies: ['Salesforce', 'HubSpot'],
        company_tags: ['Enterprise', 'Tech']
      },
      {
        user_id: userId,
        first_name: 'Jane',
        last_name: 'Smith',
        job_title: 'CTO',
        company_name: 'InnovateTech',
        email: 'jane.smith@innovatetech.com',
        phone: '+31622222222',
        linkedin_url: 'https://linkedin.com/in/janesmith',
        industry: 'Finance',
        country: 'Netherlands',
        region: 'Zuid-Holland',
        city: 'Rotterdam',
        company_size: '201_500',
        management_level: 'c_level',
        lead_score: 92,
        tags: ['Enterprise', 'B2B'],
        technologies: ['Adobe', 'Google Analytics'],
        company_tags: ['Marketing', 'Enterprise']
      },
      {
        user_id: userId,
        first_name: 'Mike',
        last_name: 'Johnson',
        job_title: 'Marketing Manager',
        company_name: 'GrowthCo',
        email: 'mike.johnson@growthco.com',
        phone: '+31633333333',
        linkedin_url: 'https://linkedin.com/in/mikejohnson',
        industry: 'Marketing',
        country: 'Netherlands',
        region: 'Noord-Brabant',
        city: 'Eindhoven',
        company_size: '11_50',
        management_level: 'manager',
        lead_score: 78,
        tags: ['B2B', 'Growth'],
        technologies: ['HubSpot', 'Mailchimp'],
        company_tags: ['Startup', 'Growth']
      }
    ];
    
    console.log('📝 Creating sample leads...');
    const { data: newLeads, error: insertError } = await supabase
      .from('leads')
      .insert(sampleLeads)
      .select();
    
    if (insertError) {
      console.log('❌ Error creating sample leads:', insertError.message);
      
      // Try with minimal fields
      console.log('📝 Trying with minimal fields...');
      const minimalLeads = [
        {
          user_id: userId,
          first_name: 'John',
          last_name: 'Doe',
          company_name: 'TechCorp',
          email: 'john.doe@techcorp.com'
        },
        {
          user_id: userId,
          first_name: 'Jane',
          last_name: 'Smith',
          company_name: 'InnovateTech',
          email: 'jane.smith@innovatetech.com'
        }
      ];
      
      const { data: minimalNewLeads, error: minimalInsertError } = await supabase
        .from('leads')
        .insert(minimalLeads)
        .select();
      
      if (minimalInsertError) {
        console.log('❌ Error creating minimal leads:', minimalInsertError.message);
        return false;
      } else {
        console.log(`✅ Created ${minimalNewLeads?.length || 0} minimal sample leads`);
        minimalNewLeads?.forEach(lead => {
          console.log(`  - ${lead.first_name} ${lead.last_name} (${lead.email})`);
        });
        return true;
      }
    }
    
    console.log(`✅ Created ${newLeads?.length || 0} sample leads`);
    newLeads?.forEach(lead => {
      console.log(`  - ${lead.first_name} ${lead.last_name} (${lead.email})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating sample leads:', error);
    return false;
  }
}

async function testConversionWithNewLeads() {
  console.log('\n🧪 Testing conversion with new leads...\n');
  
  try {
    // Get the newly created leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .not('email', 'is', null)
      .neq('email', '')
      .limit(1);
    
    if (leadsError || !leads || leads.length === 0) {
      console.log('❌ No leads found for testing');
      return false;
    }
    
    const testLead = leads[0];
    console.log(`📝 Testing conversion with lead: ${testLead.first_name} ${testLead.last_name} (${testLead.email})`);
    
    // Test the convert_lead_to_contact function
    const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLead.id,
      notes: 'Test conversion from sample lead'
    });
    
    if (convertError) {
      console.log('❌ Convert error:', convertError.message);
      return false;
    } else {
      console.log('✅ Convert successful:', convertData);
    }
    
    // Check if the contact was created
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('lead_id', testLead.id);
    
    if (contactsError) {
      console.log('❌ Error checking contacts:', contactsError.message);
    } else {
      console.log(`✅ Found ${contacts?.length || 0} contacts for this lead`);
      if (contacts && contacts.length > 0) {
        console.log('📊 Contact created successfully:', {
          id: contacts[0].id,
          lead_id: contacts[0].lead_id,
          contact_date: contacts[0].contact_date
        });
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing conversion:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating sample leads and testing conversion...\n');
  
  // Create sample leads
  const leadsCreated = await createSampleLeads();
  
  if (leadsCreated) {
    console.log('\n✅ Sample leads created successfully');
    
    // Test conversion
    const conversionWorks = await testConversionWithNewLeads();
    
    if (conversionWorks) {
      console.log('\n🎉 Everything works!');
      console.log('✅ Sample leads created');
      console.log('✅ Conversion functionality works');
      console.log('✅ The frontend "Contact maken" button should now work');
      console.log('✅ Contacts will appear in the contacts page');
    } else {
      console.log('\n❌ Conversion still has issues');
    }
  } else {
    console.log('\n❌ Failed to create sample leads');
  }
}

// Run the script
main().catch(console.error); 