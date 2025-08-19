const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

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
    const sqlPath = path.join(__dirname, 'apply-credits-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded, executing migration...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying alternative approach...');
      
      // Split SQL into smaller chunks and execute
      const sqlChunks = sqlContent.split(';').filter(chunk => chunk.trim());
      
      for (let i = 0; i < sqlChunks.length; i++) {
        const chunk = sqlChunks[i].trim();
        if (chunk) {
          console.log(`Executing chunk ${i + 1}/${sqlChunks.length}...`);
          
          try {
            const { error: chunkError } = await supabase.rpc('exec_sql', { sql: chunk });
            if (chunkError) {
              console.warn(`Warning in chunk ${i + 1}:`, chunkError.message);
            }
          } catch (e) {
            console.warn(`Warning in chunk ${i + 1}:`, e.message);
          }
        }
      }
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
    } else {
      console.log('✅ Credits table exists and is accessible!');
    }
    
    // Check if functions exist
    const { data: functionCheck, error: functionError } = await supabase
      .rpc('get_credit_balance', {
        p_client_id: '00000000-0000-0000-0000-000000000000',
        p_module_id: '00000000-0000-0000-0000-000000000000',
        p_credit_type: 'test'
      });
    
    if (functionError) {
      console.warn('⚠️ Functions may not be fully set up:', functionError.message);
    } else {
      console.log('✅ Credit functions are working!');
    }
    
    console.log('🎉 Credits system migration process completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyCreditsMigration(); 