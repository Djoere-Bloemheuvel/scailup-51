const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://dtpibyzmwgvoealsawlx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4ODA5MywiZXhwIjoyMDY4MTY0MDkzfQ.bLG7D8qGDND8OtPzBF4PdKM9wcjAjybXqZpvfbW268Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyWebhookMigration() {
  console.log('🚀 Starting webhook migration application...');
  
  try {
    // Read the webhook migration file
    const migrationPath = 'supabase/migrations/20250721000025-add-n8n-webhook-support.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Webhook migration file loaded');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement ${i + 1}:`, err);
        }
      }
    }
    
    console.log('🎉 Webhook migration completed!');
    
    // Test the webhook functions
    console.log('🧪 Testing webhook functions...');
    
    // Test get_webhook_configs function
    try {
      const { data: configs, error: configError } = await supabase.rpc('get_webhook_configs');
      if (configError) {
        console.error('❌ Error testing get_webhook_configs:', configError);
      } else {
        console.log('✅ get_webhook_configs function working');
      }
    } catch (err) {
      console.error('❌ Failed to test get_webhook_configs:', err);
    }
    
    // Test upsert_webhook_config function
    try {
      const { data: upsertResult, error: upsertError } = await supabase.rpc('upsert_webhook_config', {
        p_webhook_type: 'n8n',
        p_webhook_url: 'https://test.example.com/webhook',
        p_webhook_name: 'Test Webhook',
        p_headers: { 'Content-Type': 'application/json' }
      });
      if (upsertError) {
        console.error('❌ Error testing upsert_webhook_config:', upsertError);
      } else {
        console.log('✅ upsert_webhook_config function working');
      }
    } catch (err) {
      console.error('❌ Failed to test upsert_webhook_config:', err);
    }
    
    console.log('🎉 Webhook migration and testing completed successfully!');
    
  } catch (err) {
    console.error('❌ Failed to apply webhook migration:', err);
  }
}

// Run the migration
applyWebhookMigration(); 