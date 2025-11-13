#!/usr/bin/env node

/**
 * Utility script to switch between SCIM and API Server endpoints
 * Usage: node scripts/switch-endpoint.js [scim|apiserver]
 */

const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '..', '.env');

function updateEndpointType(newType) {
  if (!['scim', 'apiserver'].includes(newType)) {
    console.error('❌ Error: Endpoint type must be "scim" or "apiserver"');
    process.exit(1);
  }

  try {
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Update the API_ENDPOINT_TYPE line
    envContent = envContent.replace(
      /API_ENDPOINT_TYPE=.*/,
      `API_ENDPOINT_TYPE=${newType}`
    );
    
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('✅ Successfully updated endpoint configuration:');
    console.log(`📍 Endpoint Type: ${newType.toUpperCase()}`);
    
    if (newType === 'scim') {
      console.log('🌐 API Base: {{IdSBaseURI}}/obscim/v2');
      console.log('📁 Testing: SCIM endpoints');
    } else {
      console.log('🌐 API Base: {{IdSBaseURI}}/ApiServer/onbase/SCIM/v2');
      console.log('📁 Testing: API Server endpoints');
    }
    
    console.log('\n💡 Run your tests now with:');
    console.log('   npx playwright test --workers=1 --reporter=line');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
  }
}

function showCurrentConfig() {
  try {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const match = envContent.match(/API_ENDPOINT_TYPE=(.+)/);
    const currentType = match ? match[1] : 'not set';
    
    console.log('🔧 Current endpoint configuration:');
    console.log(`📍 Type: ${currentType.toUpperCase()}`);
    
    if (currentType === 'scim') {
      console.log('🌐 API Base: {{IdSBaseURI}}/obscim/v2');
    } else if (currentType === 'apiserver') {
      console.log('🌐 API Base: {{IdSBaseURI}}/ApiServer/onbase/SCIM/v2');
    }
    
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
  }
}

function showHelp() {
  console.log('🔧 Endpoint Switcher Utility');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/switch-endpoint.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  scim      Switch to SCIM endpoints (/obscim/v2)');
  console.log('  apiserver Switch to API Server endpoints (/ApiServer/onbase/SCIM/v2)');
  console.log('  status    Show current configuration');
  console.log('  help      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-endpoint.js scim');
  console.log('  node scripts/switch-endpoint.js apiserver');
  console.log('  node scripts/switch-endpoint.js status');
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'scim':
    updateEndpointType('scim');
    break;
  case 'apiserver':
    updateEndpointType('apiserver');
    break;
  case 'status':
    showCurrentConfig();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.error(`❌ Unknown command: ${command}`);
    }
    showHelp();
    process.exit(1);
}