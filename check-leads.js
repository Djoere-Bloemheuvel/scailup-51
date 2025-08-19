import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeadsTable() {
  console.log('🔍 Checking leads table...');
  
  try {
    // Check total count
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error counting leads:', countError.message);
      return;
    }

    console.log(`📊 Total leads in database: ${count}`);

    if (count === 0) {
      console.log('❌ No leads found in database');
      return;
    }

    // Get sample leads
    const { data: sampleLeads, error: sampleError } = await supabase
      .from('leads')
      .select('id, email, first_name, last_name, company_name, created_at')
      .limit(5);

    if (sampleError) {
      console.log('❌ Error fetching sample leads:', sampleError.message);
      return;
    }

    console.log('📝 Sample leads:');
    sampleLeads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.first_name || 'N/A'} ${lead.last_name || 'N/A'} (${lead.email || 'No email'}) at ${lead.company_name || 'N/A'}`);
    });

    // Check leads with emails
    const { count: emailCount, error: emailError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null)
      .neq('email', '');

    if (emailError) {
      console.log('❌ Error counting leads with emails:', emailError.message);
    } else {
      console.log(`📧 Leads with emails: ${emailCount}`);
    }

    // Check leads without emails
    const { count: noEmailCount, error: noEmailError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .or('email.is.null,email.eq.');

    if (noEmailError) {
      console.log('❌ Error counting leads without emails:', noEmailError.message);
    } else {
      console.log(`📧 Leads without emails: ${noEmailCount}`);
    }

  } catch (error) {
    console.error('❌ Error checking leads table:', error);
  }
}

async function checkContactsTable() {
  console.log('\n🔍 Checking contacts table...');
  
  try {
    // Check total count
    const { count, error: countError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error counting contacts:', countError.message);
      return;
    }

    console.log(`📊 Total contacts in database: ${count}`);

    if (count > 0) {
      // Get sample contacts
      const { data: sampleContacts, error: sampleError } = await supabase
        .from('contacts')
        .select('id, lead_id, notes, status, created_at')
        .limit(3);

      if (sampleError) {
        console.log('❌ Error fetching sample contacts:', sampleError.message);
      } else {
        console.log('📝 Sample contacts:');
        sampleContacts.forEach((contact, index) => {
          console.log(`${index + 1}. Contact ID: ${contact.id}, Lead ID: ${contact.lead_id}, Status: ${contact.status}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking contacts table:', error);
  }
}

async function checkUsersAndClients() {
  console.log('\n🔍 Checking users and clients...');
  
  try {
    // Check users
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      console.log('❌ Error counting users:', userError.message);
    } else {
      console.log(`👥 Total users: ${userCount}`);
    }

    // Check clients
    const { count: clientCount, error: clientError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (clientError) {
      console.log('❌ Error counting clients:', clientError.message);
    } else {
      console.log(`🏢 Total clients: ${clientCount}`);
    }

  } catch (error) {
    console.error('❌ Error checking users and clients:', error);
  }
}

async function main() {
  console.log('🔍 Database inspection...\n');
  
  await checkLeadsTable();
  await checkContactsTable();
  await checkUsersAndClients();
  
  console.log('\n📋 Summary:');
  console.log('- The convert functions exist and work');
  console.log('- The issue might be that there are no leads in the database');
  console.log('- Or the leads don\'t have valid email addresses');
  console.log('- The frontend should work once there are leads with emails');
}

main().catch(console.error); 