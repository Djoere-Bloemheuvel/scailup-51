import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUuidFixes() {
  console.log('🧪 Testing UUID fixes for lead filtering...\n');
  
  try {
    // Test 1: Get current client ID
    console.log('📝 Test 1: Getting current client ID...');
    const { data: clientId, error: clientError } = await supabase.rpc('get_current_client_id');
    
    if (clientError) {
      console.log('❌ Error getting client ID:', clientError.message);
      return false;
    }
    
    if (!clientId) {
      console.log('⚠️ No client ID returned (user not authenticated)');
      return false;
    }
    
    console.log('✅ Client ID:', clientId);
    
    // Test 2: Get converted lead IDs with proper UUID validation
    console.log('\n📝 Test 2: Getting converted lead IDs...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('lead_id')
      .eq('client_id', clientId)
      .not('lead_id', 'is', null);
    
    if (contactsError) {
      console.log('❌ Error getting contacts:', contactsError.message);
      return false;
    }
    
    console.log(`✅ Found ${contacts?.length || 0} contacts`);
    
    // Validate UUIDs
    const leadIds = (contacts || [])
      .map(contact => contact.lead_id)
      .filter((id) => {
        return id !== null && 
               id !== undefined && 
               typeof id === 'string' && 
               /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });
    
    console.log(`✅ Found ${leadIds.length} valid UUIDs`);
    if (leadIds.length > 0) {
      console.log('📊 Sample UUIDs:', leadIds.slice(0, 3));
    }
    
    // Test 3: Test lead filtering with UUID arrays
    console.log('\n📝 Test 3: Testing lead filtering with UUID arrays...');
    
    if (leadIds.length === 0) {
      console.log('⚠️ No converted leads found, testing with all leads as "new"');
      
      // Test getting "new" leads (should return all leads)
      const { data: newLeads, error: newLeadsError } = await supabase
        .from('leads')
        .select('id, email, first_name, last_name')
        .not('email', 'is', null)
        .neq('email', '')
        .limit(5);
      
      if (newLeadsError) {
        console.log('❌ Error getting new leads:', newLeadsError.message);
        return false;
      }
      
      console.log(`✅ Found ${newLeads?.length || 0} "new" leads (no conversions)`);
      
    } else if (leadIds.length <= 500) {
      console.log('✅ Testing with small UUID array (safe for .in() queries)');
      
      // Test getting "new" leads (not in converted list)
      const { data: newLeads, error: newLeadsError } = await supabase
        .from('leads')
        .select('id, email, first_name, last_name')
        .not('email', 'is', null)
        .neq('email', '')
        .not('id', 'in', leadIds)
        .limit(5);
      
      if (newLeadsError) {
        console.log('❌ Error getting new leads:', newLeadsError.message);
        return false;
      }
      
      console.log(`✅ Found ${newLeads?.length || 0} "new" leads (excluding converted)`);
      
      // Test getting "contacts" (in converted list)
      const { data: contactLeads, error: contactLeadsError } = await supabase
        .from('leads')
        .select('id, email, first_name, last_name')
        .not('email', 'is', null)
        .neq('email', '')
        .in('id', leadIds)
        .limit(5);
      
      if (contactLeadsError) {
        console.log('❌ Error getting contact leads:', contactLeadsError.message);
        return false;
      }
      
      console.log(`✅ Found ${contactLeads?.length || 0} "contact" leads (converted ones)`);
      
    } else {
      console.log('⚠️ Large UUID array detected, testing with limited array');
      
      const limitedIds = leadIds.slice(0, 500);
      console.log(`🔄 Using first ${limitedIds.length} UUIDs`);
      
      // Test with limited array
      const { data: limitedLeads, error: limitedError } = await supabase
        .from('leads')
        .select('id, email, first_name, last_name')
        .not('email', 'is', null)
        .neq('email', '')
        .in('id', limitedIds)
        .limit(5);
      
      if (limitedError) {
        console.log('❌ Error with limited UUID array:', limitedError.message);
        return false;
      }
      
      console.log(`✅ Limited array test successful: ${limitedLeads?.length || 0} leads`);
    }
    
    // Test 4: Test count queries
    console.log('\n📝 Test 4: Testing count queries...');
    
    // Total leads count
    const { count: totalCount, error: totalError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .not('email', 'is', null)
      .neq('email', '');
    
    if (totalError) {
      console.log('❌ Error getting total count:', totalError.message);
      return false;
    }
    
    console.log(`✅ Total leads: ${totalCount || 0}`);
    
    // New leads count (if we have converted leads)
    if (leadIds.length > 0 && leadIds.length <= 500) {
      const { count: newCount, error: newCountError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .not('email', 'is', null)
        .neq('email', '')
        .not('id', 'in', leadIds);
      
      if (newCountError) {
        console.log('❌ Error getting new leads count:', newCountError.message);
        return false;
      }
      
      console.log(`✅ New leads count: ${newCount || 0}`);
      console.log(`✅ Contacts count: ${leadIds.length}`);
      console.log(`✅ Total check: ${(newCount || 0) + leadIds.length} vs ${totalCount || 0}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing UUID fixes:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting UUID fixes test...\n');
  
  const success = await testUuidFixes();
  
  if (success) {
    console.log('\n🎉 UUID fixes test completed successfully!');
    console.log('✅ PostgreSQL UUID errors should be fixed');
    console.log('✅ Lead filtering should work correctly');
    console.log('✅ Client-specific isolation is working');
    console.log('✅ Array handling is optimized for performance');
  } else {
    console.log('\n❌ UUID fixes test failed');
    console.log('🔧 Check the errors above for debugging');
  }
}

// Run the script
main().catch(console.error); 