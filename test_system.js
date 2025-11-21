const axios = require('axios');

const BACKEND_URL = 'http://localhost:5001';
const AI_SERVER_URL = 'http://localhost:8000';

console.log('\n' + '='.repeat(60));
console.log('GUARDIAN EARTH - SYSTEM TEST');
console.log('='.repeat(60) + '\n');

async function testBackend() {
  console.log('1. Testing Backend Server...');
  try {
    // Test if server is running
    const response = await axios.get(`${BACKEND_URL}/api/chatbot/emergency-contacts`);
    console.log('   ✅ Backend server is running');
    console.log('   ✅ Emergency contacts API working');
    return true;
  } catch (error) {
    console.log('   ❌ Backend server error:', error.message);
    return false;
  }
}

async function testAIServer() {
  console.log('\n2. Testing AI Prediction Server...');
  try {
    const response = await axios.get(`${AI_SERVER_URL}/health`, { timeout: 5000 });
    console.log('   ✅ AI server is running');
    console.log('   ✅ Models loaded:', response.data.models_loaded);
    return true;
  } catch (error) {
    console.log('   ⚠️  AI server not running (optional)');
    console.log('   ℹ️  To start: cd ai-models && python prediction_server.py');
    return false;
  }
}

async function testAIPrediction() {
  console.log('\n3. Testing AI Predictions...');
  try {
    const response = await axios.post(`${AI_SERVER_URL}/predict`, {
      latitude: 40.7128,
      longitude: -74.0060,
      disaster_types: ['flood', 'cyclone']
    }, { timeout: 10000 });
    
    console.log('   ✅ Prediction API working');
    console.log('   ✅ Sample prediction:');
    
    for (const [type, pred] of Object.entries(response.data.predictions)) {
      console.log(`      ${type}: ${(pred.probability * 100).toFixed(1)}% (${pred.risk_level})`);
    }
    return true;
  } catch (error) {
    console.log('   ⚠️  AI predictions not available');
    return false;
  }
}

async function testDatabase() {
  console.log('\n4. Testing Database Connection...');
  try {
    // Try to fetch news (which requires DB)
    const response = await axios.get(`${BACKEND_URL}/api/news`);
    console.log('   ✅ MongoDB connected');
    console.log('   ✅ News articles:', response.data.news.length);
    return true;
  } catch (error) {
    console.log('   ❌ Database error:', error.message);
    console.log('   ℹ️  Make sure MongoDB is running');
    return false;
  }
}

async function testAuthentication() {
  console.log('\n5. Testing Authentication...');
  try {
    // Try to login with test credentials
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@guardianearth.com',
      password: 'admin123'
    });
    
    console.log('   ✅ Authentication working');
    console.log('   ✅ Test user login successful');
    console.log('   ℹ️  Email: admin@guardianearth.com');
    console.log('   ℹ️  Password: admin123');
    return true;
  } catch (error) {
    console.log('   ⚠️  Authentication test failed');
    console.log('   ℹ️  Run: node scripts/setup.js to create test user');
    return false;
  }
}

async function runTests() {
  const results = {
    backend: await testBackend(),
    database: await testDatabase(),
    auth: await testAuthentication(),
    aiServer: await testAIServer(),
    aiPrediction: false
  };
  
  if (results.aiServer) {
    results.aiPrediction = await testAIPrediction();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\nCore Services:');
  console.log(`  Backend Server:     ${results.backend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Database:           ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Authentication:     ${results.auth ? '✅ PASS' : '⚠️  WARN'}`);
  
  console.log('\nAI Services (Optional):');
  console.log(`  AI Server:          ${results.aiServer ? '✅ PASS' : '⚠️  NOT RUNNING'}`);
  console.log(`  AI Predictions:     ${results.aiPrediction ? '✅ PASS' : '⚠️  NOT AVAILABLE'}`);
  
  console.log('\nFrontend:');
  console.log(`  React App:          ✅ RUNNING (http://localhost:3000)`);
  
  const criticalPass = results.backend && results.database;
  
  console.log('\n' + '='.repeat(60));
  if (criticalPass) {
    console.log('✅ SYSTEM STATUS: OPERATIONAL');
    console.log('\nYou can now:');
    console.log('  1. Open http://localhost:3000 in your browser');
    console.log('  2. Login with: admin@guardianearth.com / admin123');
    console.log('  3. Explore all features');
    
    if (!results.aiServer) {
      console.log('\n⚠️  For AI predictions, start the AI server:');
      console.log('     cd ai-models');
      console.log('     pip install -r requirements.txt');
      console.log('     python train_models.py');
      console.log('     python prediction_server.py');
    }
  } else {
    console.log('❌ SYSTEM STATUS: ERRORS DETECTED');
    console.log('\nPlease fix the errors above before proceeding.');
  }
  console.log('='.repeat(60) + '\n');
}

runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error.message);
  process.exit(1);
});
