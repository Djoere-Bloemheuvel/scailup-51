const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://dtpibyzmwgvoealsawlx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4ODA5MywiZXhwIjoyMDY4MTY0MDkzfQ.bLG7D8qGDND8OtPzBF4PdKM9wcjAjybXqZpvfbW268Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFix() {
  console.log('🚀 Starting direct SQL fix execution with service role...');
  
  try {
    // Read the SQL fix file
    const fs = require('fs');
    const sqlFix = fs.readFileSync('fix-contacts-relationship.sql', 'utf8');
    
    console.log('📄 SQL fix file loaded');
    
    // Execute the SQL via RPC with service role
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlFix
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ SQL fix executed successfully!');
    console.log('📊 Result:', data);
    
  } catch (err) {
    console.error('❌ Failed to execute SQL fix:', err);
  }
}

// Alternative: Execute via direct SQL endpoint
async function executeViaSQL() {
  console.log('🔧 Executing SQL via direct endpoint...');
  
  const sqlStatements = [
    // Check if contacts table exists and create if needed
    `DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
        RAISE NOTICE 'Creating contacts table...';
        CREATE TABLE contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lead_id UUID NOT NULL,
          client_id UUID NOT NULL,
          contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          notes TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_contacts_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          CONSTRAINT fk_contacts_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
          CONSTRAINT unique_lead_per_client UNIQUE (lead_id, client_id)
        );
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Contacts table created successfully!';
      ELSE
        RAISE NOTICE 'Contacts table already exists';
      END IF;
    END $$;`,
    
    // Create RLS policies
    `CREATE POLICY IF NOT EXISTS "Users can view their own contacts" ON contacts
     FOR SELECT USING (
       client_id IN (
         SELECT c.id FROM clients c 
         JOIN users u ON c.id = u.client_id 
         WHERE u.id = auth.uid()
       )
     );`,
    
    `CREATE POLICY IF NOT EXISTS "Users can insert their own contacts" ON contacts
     FOR INSERT WITH CHECK (
       client_id IN (
         SELECT c.id FROM clients c 
         JOIN users u ON c.id = u.client_id 
         WHERE u.id = auth.uid()
       )
     );`,
    
    `CREATE POLICY IF NOT EXISTS "Users can update their own contacts" ON contacts
     FOR UPDATE USING (
       client_id IN (
         SELECT c.id FROM clients c 
         JOIN users u ON c.id = u.client_id 
         WHERE u.id = auth.uid()
       )
     );`,
    
    `CREATE POLICY IF NOT EXISTS "Users can delete their own contacts" ON contacts
     FOR DELETE USING (
       client_id IN (
         SELECT c.id FROM clients c 
         JOIN users u ON c.id = u.client_id 
         WHERE u.id = auth.uid()
       )
     );`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);`,
    
    // Create function
    `CREATE OR REPLACE FUNCTION get_contacts_with_lead_data()
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
     $$ LANGUAGE plpgsql SECURITY DEFINER;`,
    
    // Create convert function
    `CREATE OR REPLACE FUNCTION convert_lead_to_contact(lead_id UUID, notes TEXT DEFAULT NULL)
     RETURNS UUID AS $$
     DECLARE
       contact_id UUID;
       client_id UUID;
       credit_check BOOLEAN;
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
       
       -- Check and use credits
       SELECT check_and_use_credits('leads', 1, 'Convert lead to contact') INTO credit_check;
       
       IF NOT credit_check THEN
         RAISE EXCEPTION 'Insufficient credits to convert lead';
       END IF;
       
       -- Insert new contact
       INSERT INTO contacts (lead_id, client_id, notes, status)
       VALUES (convert_lead_to_contact.lead_id, convert_lead_to_contact.client_id, convert_lead_to_contact.notes, 'active')
       RETURNING id INTO contact_id;
       
       -- Log the conversion
       INSERT INTO credit_usage_logs (client_id, credit_type, amount, description, related_id)
       VALUES (convert_lead_to_contact.client_id, 'leads', 1, 'Converted lead to contact', contact_id);
       
       RETURN contact_id;
     END;
     $$ LANGUAGE plpgsql SECURITY DEFINER;`,
    
    // Add dummy contacts for testing
    `DO $$
     DECLARE
       test_client_id UUID;
       test_lead_ids UUID[];
       i INTEGER;
     BEGIN
       -- Get client_id for djoere@scailup.io
       SELECT c.id INTO test_client_id
       FROM clients c
       JOIN users u ON c.id = u.client_id
       WHERE u.email = 'djoere@scailup.io'
       LIMIT 1;
       
       IF test_client_id IS NOT NULL THEN
         -- Get some existing leads
         SELECT ARRAY_AGG(id) INTO test_lead_ids
         FROM leads
         WHERE email IS NOT NULL
         LIMIT 10;
         
         -- Insert dummy contacts
         FOR i IN 1..ARRAY_LENGTH(test_lead_ids, 1) LOOP
           INSERT INTO contacts (lead_id, client_id, notes, status, contact_date)
           VALUES (
             test_lead_ids[i],
             test_client_id,
             CASE 
               WHEN i % 3 = 0 THEN 'Interesse in premium pakket'
               WHEN i % 3 = 1 THEN 'Follow-up nodig voor demo'
               ELSE 'Nieuwe prospect - eerste contact'
             END,
             CASE 
               WHEN i % 4 = 0 THEN 'converted'
               WHEN i % 4 = 1 THEN 'inactive'
               ELSE 'active'
             END,
             NOW() - (i || ' days')::INTERVAL
           )
           ON CONFLICT (lead_id, client_id) DO NOTHING;
         END LOOP;
         
         RAISE NOTICE 'Added % dummy contacts for testing', ARRAY_LENGTH(test_lead_ids, 1);
       ELSE
         RAISE NOTICE 'Test client not found, skipping dummy data';
       END IF;
     END $$;`,
    
    // Verify the relationship works
    `SELECT 
       'Relationship test' as test_name,
       COUNT(*) as contacts_count,
       COUNT(DISTINCT c.lead_id) as unique_leads,
       COUNT(DISTINCT l.id) as leads_found
     FROM contacts c
     LEFT JOIN leads l ON c.lead_id = l.id;`
  ];
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    console.log(`📝 Executing statement ${i + 1}/${sqlStatements.length}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        if (data) {
          console.log(`📊 Result:`, data);
        }
      }
    } catch (err) {
      console.error(`❌ Failed to execute statement ${i + 1}:`, err);
    }
  }
  
  console.log('🎉 All statements executed! Contacts-Leads relationship should now work!');
}

// Run the fix
executeViaSQL(); 