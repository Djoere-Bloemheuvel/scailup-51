
import { supabase } from "@/integrations/supabase/client";

export const testRegistrationWebhook = async () => {
  try {
    console.log('🧪 Testing registration webhook...');
    
    // Create test user data similar to what would be sent upon registration
    const testUserData = {
      record: {
        id: 'test-user-id-' + Date.now(),
        email: 'test@business-domain.com', // Business email for testing
        raw_user_meta_data: {
          firstName: 'Test',
          lastName: 'User',
          company_name: 'Test Company BV',
          phone: '+31612345678'
        }
      }
    };

    console.log('📤 Sending test webhook with data:', testUserData);
    
    // Call the register webhook function directly
    const { data, error } = await supabase.functions.invoke('register-webhook', {
      body: testUserData
    });

    if (error) {
      console.error('❌ Webhook test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
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
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};

export const testBothWebhookUrls = async () => {
  try {
    console.log('🧪 Testing both webhook URLs directly...');
    
    const testPayload = {
      id: 'test-user-' + Date.now(),
      email: 'test@business-example.com',
      firstName: 'Test',
      lastName: 'User',
      company_name: 'Test Company',
      phone: '+31612345678'
    };

    const apiKey = 'sk_live_29d1f0c8a7b94efbb2ed_scailup'; // This should be from environment
    
    const urls = [
      {
        name: 'Test URL',
        url: 'https://djoere.app.n8n.cloud/webhook-test/ad791861-757c-43ab-ab02-3e412a7d66f6'
      },
      {
        name: 'Production URL', 
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
            'x-api-key': apiKey
          },
          body: JSON.stringify(testPayload)
        });

        const responseText = await response.text();
        console.log(`📡 ${name} response:`, response.status, responseText);

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

    console.log('✅ Webhook URL test results:', results);
    return {
      success: true,
      message: 'Both webhook URLs tested',
      results: results
    };
  } catch (error) {
    console.error('❌ Webhook URL test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
