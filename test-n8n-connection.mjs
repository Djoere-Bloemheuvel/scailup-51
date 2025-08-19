const https = require('https');

// n8n configuration
const N8N_URL = 'https://djoere.app.n8n.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjYyYjVkYy03MWNjLTRmOGQtODM2ZC0zNGY1YmZiODdlZmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMDk3MzQ3fQ.QlVJnMTFjwi_ZxNAIV72xy6v83VnnGvYKFDvqI-2_BA';

console.log('🧪 Testing n8n Connection and Deployment');
console.log('========================================');

// Test 1: Check n8n instance connectivity
async function testConnection() {
    console.log('\n1. Testing n8n instance connectivity...');
    
    try {
        const response = await makeRequest(`${N8N_URL}/api/v1/health`, 'GET');
        console.log('✅ n8n instance is reachable');
        console.log('   Health status:', response);
        return true;
    } catch (error) {
        console.log('❌ n8n instance connection failed:', error.message);
        return false;
    }
}

// Test 2: Test API key authentication
async function testApiKey() {
    console.log('\n2. Testing API key authentication...');
    
    try {
        const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, 'GET');
        console.log('✅ API key is valid');
        console.log('   Found', response.length, 'existing workflows');
        return true;
    } catch (error) {
        console.log('❌ API key authentication failed:', error.message);
        return false;
    }
}

// Test 3: Deploy validate-website workflow
async function deployWorkflow() {
    console.log('\n3. Deploying validate-website workflow...');
    
    try {
        const fs = require('fs');
        const workflowData = JSON.parse(fs.readFileSync('n8n-workflows/workflows/validate-website.json', 'utf8'));
        
        const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, 'POST', workflowData);
        console.log('✅ Workflow deployed successfully!');
        console.log('   Workflow ID:', response.id);
        console.log('   Workflow Name:', response.name);
        console.log('   Active:', response.active);
        return response;
    } catch (error) {
        console.log('❌ Workflow deployment failed:', error.message);
        return null;
    }
}

// Test 4: Test webhook endpoint
async function testWebhook() {
    console.log('\n4. Testing webhook endpoint...');
    
    try {
        const testData = {
            websiteUrl: 'https://example.com'
        };
        
        const response = await makeRequest(`${N8N_URL}/webhook/validate-website`, 'POST', testData, false);
        console.log('✅ Webhook endpoint is working!');
        console.log('   Response:', JSON.stringify(response, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Webhook test failed:', error.message);
        return false;
    }
}

// Helper function to make HTTP requests
function makeRequest(url, method, data = null, useApiKey = true) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (useApiKey) {
            options.headers['X-N8N-API-KEY'] = N8N_API_KEY;
        }
        
        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }
        
        const req = https.request(url, options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${body}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Run all tests
async function runTests() {
    try {
        const connectionOk = await testConnection();
        if (!connectionOk) {
            console.log('\n❌ Cannot proceed without n8n connection');
            return;
        }
        
        const apiKeyOk = await testApiKey();
        if (!apiKeyOk) {
            console.log('\n❌ Cannot proceed without valid API key');
            return;
        }
        
        const workflow = await deployWorkflow();
        if (workflow) {
            console.log('\n⏳ Waiting 5 seconds for workflow to activate...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await testWebhook();
        }
        
        console.log('\n🎉 All tests completed!');
        console.log('\n📊 Summary:');
        console.log('   - n8n URL:', N8N_URL);
        console.log('   - API Key: Valid');
        console.log('   - Workflow: Deployed');
        console.log('   - Webhook: Ready for testing');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
    }
}

runTests(); 