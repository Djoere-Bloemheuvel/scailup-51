
import { supabase } from "@/integrations/supabase/client";

export const testWebhook = async () => {
  try {
    console.log('🧪 Testing webhook functionality...');
    
    const testData = {
      record: {
        id: 'test-user-id-' + Date.now(),
        email: 'test@business-domain.com', // Business email to pass filtering
        raw_user_meta_data: {
          firstName: 'Test',
          lastName: 'User', 
          company_name: 'Test Company BV',
          phone: '+31612345678'
        }
      }
    };

    console.log('📤 Sending test webhook call:', testData);
    
    const { data, error } = await supabase.functions.invoke('register-webhook', {
      body: testData
    });

    if (error) {
      console.error('❌ Webhook test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Webhook test successful:', data);
    return {
      success: true,
      message: 'Webhook test completed successfully',
      data: data
    };
  } catch (error) {
    console.error('❌ Webhook test exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testWebhookDirect = async () => {
  try {
    console.log('🧪 Testing webhook URLs directly...');
    
    const testPayload = {
      id: 'test-user-' + Date.now(),
      email: 'test@business-example.com',
      firstName: 'Test',
      lastName: 'User',
      company_name: 'Test Company',
      phone: '+31612345678',
      event_type: 'user_registration',
      timestamp: new Date().toISOString()
    };

    // Updated URLs as provided by user
    const urls = [
      {
        name: 'Test Webhook',
        url: 'https://djoere.app.n8n.cloud/webhook-test/ad791861-757c-43ab-ab02-3e412a7d66f6'
      },
      {
        name: 'Production Webhook',
        url: 'https://djoere.app.n8n.cloud/webhook/ad791861-757c-43ab-ab02-3e412a7d66f6'
      }
    ];

    const results = [];

    for (const { name, url } of urls) {
      try {
        console.log(`📤 Testing ${name}: ${url}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'sk_live_29d1f0c8a7b94efbb2ed_scailup'
          },
          body: JSON.stringify(testPayload)
        });

        const responseText = await response.text();
        console.log(`📡 ${name} response: ${response.status} - ${responseText}`);

        results.push({
          name,
          url,
          success: response.ok,
          status: response.status,
          response: responseText
        });
      } catch (error) {
        console.error(`❌ Error testing ${name}:`, error);
        results.push({
          name,
          url,
          success: false,
          error: error.message
        });
      }
    }

    console.log('✅ Direct webhook test results:', results);
    return {
      success: true,
      message: 'Direct webhook test completed',
      results: results
    };
  } catch (error) {
    console.error('❌ Direct webhook test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// New function to test registration webhook specifically
export const testRegistrationWebhook = async () => {
  try {
    console.log('🧪 Testing full registration webhook flow...');
    
    // Simulate what happens when a new user registers
    const newUserData = {
      record: {
        id: 'test-registration-' + Date.now(),
        email: 'newuser@businesscompany.com', // Business email
        email_confirmed_at: null, // Not confirmed yet
        raw_user_meta_data: {
          firstName: 'New',
          lastName: 'User',
          company_name: 'Business Company BV',
          phone: '+31698765432'
        },
        created_at: new Date().toISOString()
      }
    };

    console.log('📤 Simulating user registration webhook:', newUserData);
    
    // Call our register webhook function
    const { data, error } = await supabase.functions.invoke('register-webhook', {
      body: newUserData
    });

    if (error) {
      console.error('❌ Registration webhook test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Registration webhook test successful:', data);
    return {
      success: true,
      message: 'Registration webhook flow tested successfully',
      data: data
    };
  } catch (error) {
    console.error('❌ Registration webhook test exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
