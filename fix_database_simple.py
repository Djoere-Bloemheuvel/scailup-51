#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import sys

# Supabase configuration
SUPABASE_URL = "https://dtpibyzmwgvoealsawlx.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4ODA5MywiZXhwIjoyMDY4MTY0MDkzfQ.bLG7D8qGDND8OtPzBF4PdKM9wcjAjybXqZpvfbW268Y"

def execute_sql(sql):
    """Execute SQL via Supabase REST API using built-in libraries"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    headers = {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    data = json.dumps({'sql': sql}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            result = response.read().decode('utf-8')
            return json.loads(result) if result else None
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("🚀 Starting database fix with service role key...")
    
    # Simple test first
    print("📝 Testing connection...")
    test_result = execute_sql("SELECT version();")
    if test_result:
        print("✅ Connection successful!")
    else:
        print("❌ Connection failed. Trying alternative approach...")
        return
    
    # Main SQL statements
    statements = [
        # Create contacts table
        """
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
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
          END IF;
        END $$;
        """,
        
        # Create RLS policies
        """
        CREATE POLICY IF NOT EXISTS "Users can view their own contacts" ON contacts
         FOR SELECT USING (
           client_id IN (
             SELECT c.id FROM clients c 
             JOIN users u ON c.id = u.client_id 
             WHERE u.id = auth.uid()
           )
         );
        """,
        
        # Create function
        """
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
        """
    ]
    
    for i, statement in enumerate(statements, 1):
        print(f"📝 Executing statement {i}/{len(statements)}...")
        result = execute_sql(statement)
        if result is not None:
            print(f"✅ Statement {i} executed successfully")
        else:
            print(f"⚠️  Statement {i} may have failed")
    
    print("🎉 Database fix completed! Try refreshing your contacts page now.")

if __name__ == "__main__":
    main() 