// Test script to validate RPC conversion function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zkrfnyokxhsgetslfodg.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcmZueW9reGhzZ2V0c2xmb2RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIwOTIzMCwiZXhwIjoyMDY4Nzg1MjMwfQ.6wP0uPZHR0L0k_pZkBKSp0iYDllm0cQ1wD-U_e_VTLU";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function testRPCConversion() {
  console.log('🧪 Testing RPC conversion function...');

  try {
    // First, get a sample lead to test with
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, company_name')
      .limit(1);

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return;
    }

    if (!leads || leads.length === 0) {
      console.log('⚠️ No leads found in the database');
      return;
    }

    const testLead = leads[0];
    console.log('📋 Testing with lead:', {
      id: testLead.id,
      name: `${testLead.first_name} ${testLead.last_name}`,
      email: testLead.email,
      company: testLead.company_name
    });

    // Test the RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc('convert_lead_to_contact', {
      p_lead_id: testLead.id
    });

    console.log('🔧 RPC Function Results:');
    console.log('Raw Result:', rpcResult);
    console.log('Error:', rpcError);
    console.log('Result Type:', typeof rpcResult);

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError);
      return;
    }

    // Validate the response structure
    if (rpcResult && typeof rpcResult === 'object') {
      console.log('✅ Response Structure Validation:');
      console.log('  - Has success field:', 'success' in rpcResult, typeof rpcResult.success);
      console.log('  - Has message field:', 'message' in rpcResult, typeof rpcResult.message);
      console.log('  - Has error field:', 'error' in rpcResult, typeof rpcResult.error);
      console.log('  - Has contact field:', 'contact' in rpcResult, typeof rpcResult.contact);
      
      if (rpcResult.success) {
        console.log('🎉 Conversion successful!');
        console.log('   Message:', rpcResult.message);
        if (rpcResult.contact) {
          console.log('   Contact ID:', rpcResult.contact.id);
        }
      } else {
        console.log('❌ Conversion failed:');
        console.log('   Error:', rpcResult.error);
        console.log('   Message:', rpcResult.message);
      }
    } else {
      console.error('❌ Invalid response format:', rpcResult);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRPCConversion().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
}); 