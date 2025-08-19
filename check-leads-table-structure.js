import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');
  
  try {
    // Check leads table structure by trying to insert a minimal record
    console.log('📝 Checking leads table structure...');
    
    // Try to get one record to see the structure
    const { data: sampleLead, error: sampleError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('❌ Error getting sample lead:', sampleError.message);
    } else {
      console.log('✅ Leads table accessible');
      if (sampleLead && sampleLead.length > 0) {
        console.log('📊 Sample lead structure:');
        Object.keys(sampleLead[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof sampleLead[0][key]} (${sampleLead[0][key]})`);
        });
      } else {
        console.log('📊 No leads found, checking table schema...');
      }
    }
    
    // Check contacts table structure
    console.log('\n📝 Checking contacts table structure...');
    const { data: sampleContact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
    
    if (contactError) {
      console.log('❌ Error getting sample contact:', contactError.message);
    } else {
      console.log('✅ Contacts table accessible');
      if (sampleContact && sampleContact.length > 0) {
        console.log('📊 Sample contact structure:');
        Object.keys(sampleContact[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof sampleContact[0][key]} (${sampleContact[0][key]})`);
        });
      }
    }
    
    // Check clients table structure
    console.log('\n📝 Checking clients table structure...');
    const { data: sampleClient, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientError) {
      console.log('❌ Error getting sample client:', clientError.message);
    } else {
      console.log('✅ Clients table accessible');
      if (sampleClient && sampleClient.length > 0) {
        console.log('📊 Sample client structure:');
        Object.keys(sampleClient[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof sampleClient[0][key]} (${sampleClient[0][key]})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

async function tryCreateLeadWithMinimalData() {
  console.log('\n🔧 Trying to create lead with minimal data...\n');
  
  try {
    // Try different column combinations
    const testData = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      company: 'Test Company',
      created_at: new Date().toISOString()
    };
    
    console.log('📝 Trying to insert lead with:', testData);
    
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      
      // Try without created_at
      console.log('📝 Trying without created_at...');
      const { email, first_name, last_name, company } = testData;
      const { data: newLead2, error: insertError2 } = await supabase
        .from('leads')
        .insert({ email, first_name, last_name, company })
        .select()
        .single();
      
      if (insertError2) {
        console.log('❌ Insert error 2:', insertError2.message);
        return false;
      } else {
        console.log('✅ Lead created successfully:', newLead2);
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
      notes: 'Test conversion from structure check'
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

async function main() {
  console.log('🚀 Starting table structure check...\n');
  
  // Check table structures
  await checkTableStructure();
  
  // Try to create a test lead
  const newLead = await tryCreateLeadWithMinimalData();
  
  if (newLead) {
    // Test conversion
    const conversionWorks = await testConversionWithNewLead(newLead.id);
    
    if (conversionWorks) {
      console.log('\n🎉 Conversion works with the correct table structure!');
      console.log('✅ The issue was the wrong column names');
      console.log('✅ Frontend should work now with proper column mapping');
    } else {
      console.log('\n❌ Conversion still fails even with correct structure');
      console.log('🔧 This suggests a deeper issue with the functions');
    }
  } else {
    console.log('\n❌ Could not create test lead');
    console.log('🔧 Need to check the exact table schema');
  }
}

// Run the script
main().catch(console.error); 