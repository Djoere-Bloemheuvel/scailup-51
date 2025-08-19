import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dtpibyzmwgvoealsawlx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cGlieXptd2d2b2VhbHNhd2x4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4ODA5MywiZXhwIjoyMDY4MTY0MDkzfQ.bLG7D8qGDND8OtPzBF4PdKM9wcjAjybXqZpvfbW268Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating super admin account for djoere@scailup.io...')
    
    // First, check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail('djoere@scailup.io')
    
    if (userError) {
      console.log('⚠️ User not found, will create profile when user signs up')
    } else {
      console.log('✅ User found:', user.user.email)
    }
    
    // Create super admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user?.user?.id || null,
        email: 'djoere@scailup.io',
        full_name: 'Djoere Bloemheuvel',
        company_name: 'ScailUp',
        role: 'super_admin',
        is_admin: true,
        is_super_admin: true,
        credits: 999999,
        unlimited_credits: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
    } else {
      console.log('✅ Super admin profile created/updated')
    }
    
    // Update user metadata if user exists
    if (user?.user?.id) {
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        user.user.id,
        {
          user_metadata: {
            is_admin: true,
            is_super_admin: true
          }
        }
      )
      
      if (metadataError) {
        console.error('❌ Metadata update error:', metadataError)
      } else {
        console.log('✅ User metadata updated')
      }
    }
    
    // Add super admin settings
    if (user?.user?.id) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.user.id,
          setting_key: 'super_admin_access_level',
          setting_value: 'full',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        })
      
      if (settingsError) {
        console.error('❌ Settings creation error:', settingsError)
      } else {
        console.log('✅ Super admin settings created')
      }
    }
    
    // Log the creation
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        action: 'super_admin_account_created',
        details: JSON.stringify({
          email: 'djoere@scailup.io',
          access_level: 'super_admin',
          unlimited_credits: true
        }),
        created_at: new Date().toISOString()
      })
    
    if (logError) {
      console.error('❌ Log creation error:', logError)
    } else {
      console.log('✅ Admin log created')
    }
    
    console.log('🎉 Super admin account setup complete!')
    console.log('👑 djoere@scailup.io now has super admin privileges')
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
  }
}

createSuperAdmin() 