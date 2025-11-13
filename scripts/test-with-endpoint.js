#!/usr/bin/env node

/**
 * Test runner with endpoint type support
 * Usage: node scripts/test-with-endpoint.js [scim|apiserver] [playwright-args...]
 */

const { spawn } = require('child_process');
const path = require('path');

function showHelp() {
  console.log('🧪 Test Runner with Endpoint Type Support');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/test-with-endpoint.js [endpoint-type] [playwright-args...]');
  console.log('');
  console.log('Endpoint Types:');
  console.log('  scim      Run tests against SCIM endpoints (/obscim/v2)');
  console.log('  apiserver Run tests against API Server endpoints (/ApiServer/onbase/SCIM/v2)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/test-with-endpoint.js scim');
  console.log('  node scripts/test-with-endpoint.js apiserver --workers=1');
  console.log('  node scripts/test-with-endpoint.js scim --grep="User" --reporter=line');
  console.log('  node scripts/test-with-endpoint.js apiserver --headed --grep="ServiceProviderConfig"');
  console.log('');
  console.log('Default Playwright args: --workers=1 --reporter=line');
}

function runTests(endpointType, playwrightArgs) {
  console.log(`🚀 Running tests with ${endpointType.toUpperCase()} endpoints...`);
  
  // Set environment variable for this test run
  const env = { ...process.env, ENDPOINT_TYPE: endpointType };
  
  // Default args if none provided
  const defaultArgs = ['--workers=1', '--reporter=line'];
  const args = playwrightArgs.length > 0 ? playwrightArgs : defaultArgs;
  
  console.log(`📝 Command: npx playwright test ${args.join(' ')}`);
  console.log(`🔧 Endpoint Type: ${endpointType.toUpperCase()}`);
  console.log('');
  
  // Run Playwright with the specified endpoint type
  const child = spawn('npx', ['playwright', 'test', ...args], {
    env,
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log(`✅ Tests completed successfully with ${endpointType.toUpperCase()} endpoints`);
    } else {
      console.log(`❌ Tests failed with exit code ${code}`);
    }
    process.exit(code);
  });
  
  child.on('error', (err) => {
    console.error('❌ Error running tests:', err.message);
    process.exit(1);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

const endpointType = args[0];
const playwrightArgs = args.slice(1);

// Validate endpoint type
if (!['scim', 'apiserver'].includes(endpointType)) {
  console.error(`❌ Error: Invalid endpoint type '${endpointType}'. Must be 'scim' or 'apiserver'.`);
  console.log('');
  showHelp();
  process.exit(1);
}

// Run the tests
runTests(endpointType, playwrightArgs);