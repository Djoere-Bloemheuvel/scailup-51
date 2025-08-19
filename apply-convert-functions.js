import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying convert functions migration...');
  
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250721000000-create-convert-functions.sql', 'utf8');
    
    console.log('📝 Executing migration SQL...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

async function testFunctions() {
  console.log('\n🧪 Testing functions after migration...');
  
  try {
    // Test convert_lead_to_contact function
    console.log('📝 Testing convert_lead_to_contact...');
    const testLeadId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    const { data, error } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test conversion'
    });

    if (error) {
      if (error.message.includes('Lead not found')) {
        console.log('✅ convert_lead_to_contact function exists and works (expected error for dummy lead)');
      } else {
        console.log('❌ convert_lead_to_contact function error:', error.message);
        return false;
      }
    } else {
      console.log('✅ convert_lead_to_contact function exists and works!');
    }
    
    // Test get_contacts_with_lead_data function
    console.log('📝 Testing get_contacts_with_lead_data...');
    const { data: contactsData, error: contactsError } = await supabase.rpc('get_contacts_with_lead_data');

    if (contactsError) {
      console.log('❌ get_contacts_with_lead_data function error:', contactsError.message);
      return false;
    } else {
      console.log('✅ get_contacts_with_lead_data function exists and works!');
      console.log(`📊 Found ${contactsData?.length || 0} contacts`);
    }
    
    // Test check_and_use_credits function
    console.log('📝 Testing check_and_use_credits...');
    const { data: creditsData, error: creditsError } = await supabase.rpc('check_and_use_credits', {
      credit_type: 'leads',
      amount: 1,
      description: 'Test credit check'
    });

    if (creditsError) {
      if (creditsError.message.includes('Client not found')) {
        console.log('✅ check_and_use_credits function exists and works (expected error for service role)');
      } else {
        console.log('❌ check_and_use_credits function error:', creditsError.message);
        return false;
      }
    } else {
      console.log('✅ check_and_use_credits function exists and works!');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Function testing failed:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting convert functions setup...\n');
  
  // Apply migration
  const migrationSuccess = await applyMigration();
  
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed, trying alternative approach...');
    
    // Try to create functions individually
    console.log('📝 Creating functions individually...');
    
    const functions = [
      {
        name: 'convert_lead_to_contact',
        sql: `
          CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
          RETURNS UUID AS $$
          DECLARE
            contact_id UUID;
            client_id UUID;
            lead_exists BOOLEAN;
            contact_exists BOOLEAN;
          BEGIN
            -- Get client_id for current user
            SELECT c.id INTO client_id
            FROM clients c
            JOIN users u ON c.id = u.client_id
            WHERE u.id = auth.uid();
            
            IF client_id IS NULL THEN
              RAISE EXCEPTION 'Client not found for user';
            END IF;
            
            -- Check if lead exists and is accessible
            SELECT EXISTS(
              SELECT 1 FROM leads 
              WHERE id = convert_lead_to_contact.lead_id
                AND email IS NOT NULL 
                AND email != ''
            ) INTO lead_exists;
            
            IF NOT lead_exists THEN
              RAISE EXCEPTION 'Lead not found or invalid';
            END IF;
            
            -- Check if contact already exists
            SELECT EXISTS(
              SELECT 1 FROM contacts 
              WHERE lead_id = convert_lead_to_contact.lead_id 
                AND client_id = convert_lead_to_contact.client_id
            ) INTO contact_exists;
            
            IF contact_exists THEN
              RAISE EXCEPTION 'Contact already exists for this lead';
            END IF;
            
            -- Insert new contact
            INSERT INTO contacts (lead_id, client_id, notes, status)
            VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
            RETURNING id INTO contact_id;
            
            RETURN contact_id;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      },
      {
        name: 'get_contacts_with_lead_data',
        sql: `
          CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
          RETURNS TABLE (
            id UUID,
            lead_id UUID,
            client_id UUID,
            contact_date TIMESTAMP WITH TIME ZONE,
            notes TEXT,
            status TEXT,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE,
            lead_first_name TEXT,
            lead_last_name TEXT,
            lead_email TEXT,
            lead_company_name TEXT,
            lead_job_title TEXT,
            lead_industry TEXT,
            lead_country TEXT,
            lead_company_summary TEXT,
            lead_product_match_percentage INTEGER,
            lead_match_reasons TEXT[],
            lead_unique_angles TEXT[],
            lead_best_campaign_match TEXT,
            lead_personalized_icebreaker TEXT
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              c.id,
              c.lead_id,
              c.client_id,
              c.contact_date,
              c.notes,
              c.status,
              c.created_at,
              c.updated_at,
              l.first_name,
              l.last_name,
              l.email,
              l.company_name,
              l.job_title,
              l.industry,
              l.country,
              l.company_summary,
              l.product_match_percentage,
              l.match_reasons,
              l.unique_angles,
              l.best_campaign_match,
              l.personalized_icebreaker
            FROM contacts c
            JOIN leads l ON c.lead_id = l.id
            WHERE c.client_id IN (
              SELECT cl.id FROM clients cl 
              JOIN users u ON cl.id = u.client_id 
              WHERE u.id = auth.uid()
            )
            ORDER BY c.contact_date DESC;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }
    ];
    
    for (const func of functions) {
      try {
        console.log(`📝 Creating ${func.name}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: func.sql });
        
        if (error) {
          console.log(`❌ Failed to create ${func.name}:`, error.message);
        } else {
          console.log(`✅ ${func.name} created successfully!`);
        }
      } catch (error) {
        console.log(`❌ Error creating ${func.name}:`, error.message);
      }
    }
  }
  
  // Test functions
  const testSuccess = await testFunctions();
  
  if (testSuccess) {
    console.log('\n🎉 All functions are working! Convert leads to contact functionality is now available.');
  } else {
    console.log('\n⚠️ Some functions may not be working properly. Please check the Supabase dashboard.');
  }
}

// Run the script
main().catch(console.error); 