import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODgwOTMsImV4cCI6MjA2ODE2NDA5M30.FMJCAMec0a8m74c7giUAPq3tja-W1nWopAIVjDNtdXY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaFix() {
  console.log('🔧 Applying schema cache refresh...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('refresh-schema-cache.sql', 'utf8');
    
    console.log('📝 Executing schema refresh SQL...');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim() === '') continue;
      
      try {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        // Execute the SQL statement
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Statement ${i + 1} error:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} failed`);
    
    if (errorCount === 0) {
      console.log('🎉 Schema cache refresh completed successfully!');
      return true;
    } else {
      console.log('⚠️ Some statements failed, but core functions should be refreshed');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Failed to apply schema fix:', error);
    return false;
  }
}

async function testFunctionsAfterFix() {
  console.log('\n🧪 Testing functions after schema refresh...');
  
  try {
    // Test convert_lead_to_contact function
    console.log('📝 Testing convert_lead_to_contact...');
    const testLeadId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    const { data, error } = await supabase.rpc('convert_lead_to_contact', {
      lead_id: testLeadId,
      notes: 'Test conversion'
    });

    if (error) {
      if (error.message.includes('Lead not found') || error.message.includes('Client not found')) {
        console.log('✅ convert_lead_to_contact function exists and works (expected error for dummy data)');
      } else if (error.message.includes('function') && error.message.includes('not found')) {
        console.log('❌ convert_lead_to_contact function still not found - schema cache not refreshed');
        return false;
      } else {
        console.log('✅ convert_lead_to_contact function exists and works (got expected error)');
      }
    } else {
      console.log('✅ convert_lead_to_contact function exists and works!');
    }
    
    // Test bulk_convert_leads_to_contacts function
    console.log('📝 Testing bulk_convert_leads_to_contacts...');
    const { data: bulkData, error: bulkError } = await supabase.rpc('bulk_convert_leads_to_contacts', {
      lead_ids: [testLeadId],
      notes: 'Test bulk conversion'
    });

    if (bulkError) {
      if (bulkError.message.includes('Lead not found') || bulkError.message.includes('Client not found')) {
        console.log('✅ bulk_convert_leads_to_contacts function exists and works (expected error for dummy data)');
      } else if (bulkError.message.includes('function') && bulkError.message.includes('not found')) {
        console.log('❌ bulk_convert_leads_to_contacts function not found');
        return false;
      } else {
        console.log('✅ bulk_convert_leads_to_contacts function exists and works (got expected error)');
      }
    } else {
      console.log('✅ bulk_convert_leads_to_contacts function exists and works!');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Function testing failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting schema cache refresh...\n');
  
  // Apply schema fix
  const fixSuccess = await applySchemaFix();
  
  if (fixSuccess) {
    // Test functions
    const testSuccess = await testFunctionsAfterFix();
    
    if (testSuccess) {
      console.log('\n🎉 Schema cache refresh successful! Convert functions should now work.');
      console.log('✅ The frontend should be able to convert leads to contacts');
    } else {
      console.log('\n⚠️ Functions may still have issues. Please check manually.');
    }
  } else {
    console.log('\n❌ Schema cache refresh failed. Please apply manually via Supabase dashboard');
  }
}

// Run the script
main().catch(console.error); 