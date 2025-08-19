import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCreditsMigration() {
  try {
    console.log('🚀 Starting credits system migration...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('apply-credits-migration.sql', 'utf8');
    
    console.log('📄 SQL file loaded, executing migration...');
    
    // Execute the SQL using the service role
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      console.log('Please run the SQL manually in the Supabase SQL Editor');
      console.log('Copy the contents of apply-credits-migration.sql and paste it in the SQL Editor');
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    
    // Check if credits table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('credits')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Credits table not found:', tableError);
      console.log('Please check the Supabase dashboard to see if the migration was applied');
    } else {
      console.log('✅ Credits table exists and is accessible!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('Please run the SQL manually in the Supabase SQL Editor');
    console.log('Copy the contents of apply-credits-migration.sql and paste it in the SQL Editor');
  }
}

// Run the migration
applyCreditsMigration(); 