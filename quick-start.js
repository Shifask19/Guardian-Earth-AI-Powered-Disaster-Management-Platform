#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌍 Guardian Earth - Quick Start\n');

// Check if we're in the right directory
const fs = require('fs');
if (!fs.existsSync('client/package.json')) {
  console.error('❌ Please run this from the Guardian Earth root directory');
  process.exit(1);
}

console.log('🚀 Starting frontend (client-only mode)...');
console.log('📍 This mode works without backend server\n');

// Start the client
const client = spawn('npm', ['start'], {
  stdio: 'inherit',
  cwd: path.join(process.cwd(), 'client'),
  shell: true
});

client.on('error', (error) => {
  console.error('❌ Failed to start client:', error.message);
  console.log('\n💡 Make sure you have installed dependencies:');
  console.log('   npm install');
  console.log('   cd client && npm install');
  process.exit(1);
});

client.on('close', (code) => {
  console.log(`\n🛑 Client stopped with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping client...');
  client.kill('SIGINT');
  process.exit(0);
});

console.log('💡 To start with backend server, use: npm run dev');
console.log('📖 Check SETUP.md for complete instructions\n');