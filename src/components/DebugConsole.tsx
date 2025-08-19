import { useEffect } from 'react';

export const DebugConsole = () => {
  useEffect(() => {
    console.log('🔧 ================== WEBHOOK TEST INSTRUCTIONS ==================');
    console.log('🔧 Voor directe webhook test:');
    console.log('🔧 1. Open browser developer tools (F12)');
    console.log('🔧 2. Ga naar Console tab');
    console.log('🔧 3. Type: simpleTest() en druk Enter');
    console.log('🔧 4. Of type: testWebhook() voor uitgebreide test');
    console.log('🔧 5. Check of je "Workflow was started" ziet');
    console.log('🔧 ================== WEBHOOK TEST INSTRUCTIONS ==================');
  }, []);

  return null; // This component doesn't render anything visible
};

export default DebugConsole; 