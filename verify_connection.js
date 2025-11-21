const axios = require('axios');

async function verifyConnection() {
  console.log('🔍 Verifying Backend Connection...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3002/api/health');
    console.log('✅ Backend Health Check:', healthResponse.data);
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:3002/');
    console.log('✅ Backend Root:', rootResponse.data);
    
    console.log('\n🎉 Backend is running successfully!');
    console.log('📍 Backend URL: http://localhost:3002');
    console.log('📍 Frontend should proxy to: http://localhost:3002');
    console.log('📍 Socket.IO URL: http://localhost:3002');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: npm run server-simple');
    console.log('2. Check if port 3002 is available');
    console.log('3. Verify MongoDB is running');
  }
}

verifyConnection();