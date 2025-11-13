const fs = require('fs');

// Read the test file
let content = fs.readFileSync('tests/scim-api.spec.ts', 'utf8');

console.log('🚀 Starting removal of updateTestTitleWithStatus function calls...');

// Remove all calls to updateTestTitleWithStatus function
const beforeCount = (content.match(/await updateTestTitleWithStatus\(/g) || []).length;
console.log(`📊 Found ${beforeCount} updateTestTitleWithStatus calls`);

// Remove the function calls and the line breaks
content = content.replace(/\s*await updateTestTitleWithStatus\([^;]+;\s*\n/g, '');

// Also remove just the function calls without extra whitespace handling
content = content.replace(/await updateTestTitleWithStatus\([^;]+;\n?/g, '');

const afterCount = (content.match(/await updateTestTitleWithStatus\(/g) || []).length;
console.log(`📊 Remaining updateTestTitleWithStatus calls: ${afterCount}`);

// Write the updated content back
fs.writeFileSync('tests/scim-api.spec.ts', content, 'utf8');

console.log('✅ Removed all updateTestTitleWithStatus function calls');
console.log('✅ All tests should now have consistent formatting without status code annotations');