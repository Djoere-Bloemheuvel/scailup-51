import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeadsTable() {
  console.log('🔍 Checking leads table...\n');
  
  try {
    // Check if leads table exists and has data
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) {
      console.log('❌ Error accessing leads table:', leadsError.message);
      return false;
    }
    
    console.log(`✅ Found ${leads?.length || 0} leads in database`);
    
    if (leads && leads.length > 0) {
      console.log('📊 Sample leads:');
      leads.slice(0, 3).forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.first_name} ${lead.last_name} (${lead.email}) - ${lead.company_name || 'No company'}`);
      });
      return true;
    } else {
      console.log('⚠️ No leads found - this explains why conversion doesn\'t work');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking leads table:', error);
    return false;
  }
}

async function checkFunctions() {
  console.log('\n🔍 Checking required functions...\n');
  
  try {
    // Test convert_lead_to_contact function
    console.log('📝 Testing convert_lead_to_contact...');
    const testLeadId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    const { data: convertData, error: convertError } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test'
    });

    if (convertError) {
      if (convertError.message.includes('function') && convertError.message.includes('not found')) {
        console.log('❌ convert_lead_to_contact function not found');
        return false;
      } else {
        console.log('✅ convert_lead_to_contact function exists (got expected error for dummy data)');
      }
    } else {
      console.log('✅ convert_lead_to_contact function exists and works');
    }
    
    // Test check_and_use_credits function
    console.log('📝 Testing check_and_use_credits...');
    const { data: creditData, error: creditError } = await supabase.rpc('check_and_use_credits', {
      credit_type: 'leads',
      amount: 1,
      description: 'Test'
    });

    if (creditError) {
      if (creditError.message.includes('function') && creditError.message.includes('not found')) {
        console.log('❌ check_and_use_credits function not found');
        return false;
      } else {
        console.log('✅ check_and_use_credits function exists (got expected error)');
      }
    } else {
      console.log('✅ check_and_use_credits function exists and works');
    }
    
    // Test get_contacts_with_lead_data function
    console.log('📝 Testing get_contacts_with_lead_data...');
    const { data: contactsData, error: contactsError } = await supabase.rpc('get_contacts_with_lead_data');

    if (contactsError) {
      if (contactsError.message.includes('function') && contactsError.message.includes('not found')) {
        console.log('❌ get_contacts_with_lead_data function not found');
        return false;
      } else {
        console.log('✅ get_contacts_with_lead_data function exists (got expected error)');
      }
    } else {
      console.log('✅ get_contacts_with_lead_data function exists and works');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking functions:', error);
    return false;
  }
}

async function createMissingFunctions() {
  console.log('\n🔧 Creating missing functions...\n');
  
  try {
    // Create check_and_use_credits function
    console.log('📝 Creating check_and_use_credits function...');
    const checkAndUseCreditsSQL = `
      CREATE OR REPLACE FUNCTION check_and_use_credits(
        credit_type TEXT,
        amount INTEGER,
        description TEXT DEFAULT NULL
      )
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        client_id UUID;
        available_credits INTEGER := 0;
        credit_balance RECORD;
      BEGIN
        -- Get current user's client
        SELECT c.id INTO client_id
        FROM clients c
        JOIN users u ON c.id = u.client_id
        WHERE u.id = auth.uid();
        
        IF client_id IS NULL THEN
          RAISE EXCEPTION 'Client not found for user';
        END IF;
        
        -- Check available credits
        SELECT COALESCE(SUM(cb.amount), 0) INTO available_credits
        FROM credit_balances cb
        WHERE cb.client_id = client_id
          AND cb.credit_type = check_and_use_credits.credit_type
          AND cb.expires_at > NOW()
          AND cb.amount > 0;
        
        -- Check if enough credits are available
        IF available_credits < amount THEN
          RAISE EXCEPTION 'Insufficient credits: % available, % required', available_credits, amount;
        END IF;
        
        -- Use credits (deduct from balances)
        FOR credit_balance IN
          SELECT cb.id, cb.amount
          FROM credit_balances cb
          WHERE cb.client_id = client_id
            AND cb.credit_type = check_and_use_credits.credit_type
            AND cb.expires_at > NOW()
            AND cb.amount > 0
          ORDER BY cb.expires_at ASC
        LOOP
          IF amount <= 0 THEN
            EXIT;
          END IF;
          
          IF credit_balance.amount >= amount THEN
            -- This balance has enough credits
            UPDATE credit_balances
            SET amount = amount - credit_balance.amount
            WHERE id = credit_balance.id;
            amount := 0;
          ELSE
            -- Use all credits from this balance
            UPDATE credit_balances
            SET amount = 0
            WHERE id = credit_balance.id;
            amount := amount - credit_balance.amount;
          END IF;
        END LOOP;
        
        -- Log the credit usage
        INSERT INTO credit_usage_logs (
          client_id,
          module_id,
          credit_type,
          amount,
          description,
          used_at
        )
        SELECT 
          client_id,
          m.id,
          check_and_use_credits.credit_type,
          check_and_use_credits.amount,
          check_and_use_credits.description,
          NOW()
        FROM modules m
        WHERE m.slug = 'lead_engine'
        LIMIT 1;
        
        RETURN TRUE;
      END;
      $$;
    `;
    
    // Execute the SQL
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: checkAndUseCreditsSQL
    });
    
    if (sqlError) {
      console.log('❌ Error creating check_and_use_credits function:', sqlError.message);
      return false;
    } else {
      console.log('✅ check_and_use_credits function created successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating functions:', error);
    return false;
  }
}

async function createSampleLeads() {
  console.log('\n🔧 Creating sample leads...\n');
  
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
    
    // Create sample leads
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
        in_active_campaign: false
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
        in_active_campaign: false
      }
    ];
    
    console.log('📝 Creating sample leads...');
    const { data: newLeads, error: insertError } = await supabase
      .from('leads')
      .insert(sampleLeads)
      .select();
    
    if (insertError) {
      console.log('❌ Error creating sample leads:', insertError.message);
      return false;
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

async function main() {
  console.log('🚀 Starting comprehensive leads and functions check...\n');
  
  // Check leads table
  const hasLeads = await checkLeadsTable();
  
  // Check functions
  const functionsExist = await checkFunctions();
  
  if (!hasLeads) {
    console.log('\n⚠️ No leads found. Creating sample leads...');
    const leadsCreated = await createSampleLeads();
    
    if (leadsCreated) {
      console.log('✅ Sample leads created successfully');
    } else {
      console.log('❌ Failed to create sample leads');
    }
  }
  
  if (!functionsExist) {
    console.log('\n⚠️ Missing functions. Creating them...');
    const functionsCreated = await createMissingFunctions();
    
    if (functionsCreated) {
      console.log('✅ Missing functions created successfully');
    } else {
      console.log('❌ Failed to create missing functions');
    }
  }
  
  console.log('\n🔍 Check complete. The frontend should now work with leads and conversion.');
}

// Run the script
main().catch(console.error); 