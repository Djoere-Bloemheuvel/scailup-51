import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeadsStructure() {
  console.log('🔍 Checking actual leads table structure...\n');
  
  try {
    // Get the user ID
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ No clients found');
      return;
    }
    
    const userId = clients[0].user_id;
    console.log(`✅ Using user ID: ${userId}`);
    
    // Try different column combinations to find the actual structure
    const testCases = [
      {
        name: 'Basic fields only',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User'
        }
      },
      {
        name: 'With email',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        }
      },
      {
        name: 'With company',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          company: 'Test Company'
        }
      },
      {
        name: 'With job_title',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          company: 'Test Company',
          job_title: 'CEO'
        }
      },
      {
        name: 'With phone',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          company: 'Test Company',
          job_title: 'CEO',
          phone: '+31612345678'
        }
      },
      {
        name: 'With linkedin_url',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          company: 'Test Company',
          job_title: 'CEO',
          phone: '+31612345678',
          linkedin_url: 'https://linkedin.com/in/testuser'
        }
      },
      {
        name: 'With industry',
        data: {
          user_id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          company: 'Test Company',
          job_title: 'CEO',
          phone: '+31612345678',
          linkedin_url: 'https://linkedin.com/in/testuser',
          industry: 'Technology'
        }
      }
    ];
    
    let workingStructure = null;
    
    for (const testCase of testCases) {
      console.log(`📝 Testing: ${testCase.name}`);
      
      try {
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert(testCase.data)
          .select()
          .single();
        
        if (insertError) {
          console.log(`❌ Failed: ${insertError.message}`);
        } else {
          console.log(`✅ Success! Lead created with ID: ${newLead.id}`);
          workingStructure = testCase.data;
          
          // Clean up the test lead
          await supabase
            .from('leads')
            .delete()
            .eq('id', newLead.id);
          
          break;
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    if (workingStructure) {
      console.log('\n🎉 Found working structure:');
      console.log(JSON.stringify(workingStructure, null, 2));
      
      // Now create a proper test lead
      console.log('\n🔧 Creating proper test lead...');
      const { data: testLead, error: testError } = await supabase
        .from('leads')
        .insert(workingStructure)
        .select()
        .single();
      
      if (testError) {
        console.log('❌ Error creating test lead:', testError.message);
      } else {
        console.log('✅ Test lead created:', testLead);
        
        // Test conversion
        console.log('\n🧪 Testing conversion...');
        const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
          lead_id: testLead.id,
          notes: 'Test conversion'
        });
        
        if (convertError) {
          console.log('❌ Convert error:', convertError.message);
        } else {
          console.log('✅ Convert successful:', convertData);
          console.log('\n🎉 Everything works! The frontend should work now.');
        }
      }
    } else {
      console.log('\n❌ Could not find working structure');
    }
    
  } catch (error) {
    console.error('❌ Error checking structure:', error);
  }
}

// Run the script
checkLeadsStructure().catch(console.error); 