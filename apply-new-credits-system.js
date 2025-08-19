import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4ODA5MywiZXhwIjoyMDY4MTY0MDkzfQ.bLG7D8qGDND8OtPzBF4PdKM9wcjAjybXqZpvfbW268Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyNewCreditsSystem() {
  try {
    console.log('🔄 Applying new credits system...')
    
    // Read the migration file
    const fs = await import('fs')
    const path = await import('path')
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250725000000-recreate-credits-system.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded, executing...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Error applying migration:', error)
      return
    }
    
    console.log('✅ New credits system applied successfully!')
    console.log('🎉 Main table: credits')
    console.log('📊 Features:')
    console.log('   - Single credits table with balance tracking')
    console.log('   - Credit transactions logging')
    console.log('   - Backward compatibility with existing code')
    console.log('   - Lovable compatibility maintained')
    console.log('   - Automatic credits for new clients')
    console.log('   - Unlimited credits for super admin')
    
  } catch (error) {
    console.error('❌ Error applying new credits system:', error)
  }
}

applyNewCreditsSystem() 