# SCIM API Test Framework

This is a comprehensive test automation framework for SCIM 2.0 API testing using Playwright and TypeScript.

## Branch Structure

- **`main`** - Clean framework only (utilities, configs, documentation)
- **`develop`** - Full test suite with all tests (working/development branch)
- **`poc`** - Showcase with 5-6 selected tests for demonstration

## Framework Components

### Core Utilities (`utils/`)

#### `api-config.ts`
- **Purpose**: API configuration, authentication, and validation utilities
- **Key Features**:
  - OAuth2 token management
  - Endpoint configuration (SCIM/API Server)
  - Request/response validation
  - OEM vs Non-OEM environment handling
  
#### `db-config.ts`
- **Purpose**: Database operations for test data setup/cleanup
- **Key Features**:
  - SQL Server connection pooling
  - User CRUD operations
  - Environment-specific database configuration

### Configuration Files

#### `playwright.config.ts`
- Playwright test runner configuration
- Browser settings
- Reporter configuration
- Timeout settings

#### `.env` files
- `.env` - Main configuration
- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

#### `global-setup.ts`
- Global test setup executed before all tests
- Environment validation
- OAuth token acquisition

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { 
  createApiTestContext, 
  ApiTestContext, 
  ApiEndpoints, 
  ApiValidators, 
  logApiRequest 
} from '../utils/api-config';

test.describe('Your Test Suite', () => {
  let apiContext: ApiTestContext;
  
  test.beforeAll(async ({ request }) => {
    apiContext = await createApiTestContext(request);
  });
  
  test('Your test name', async ({ request }) => {
    const endpoint = ApiEndpoints.users();
    const response = await request.get(`${apiContext.baseUrl}${endpoint}`, {
      headers: apiContext.headers
    });
    
    ApiValidators.validateResponseStatus(response, 200);
    const body = await ApiValidators.validateJsonResponse(response);
    
    // Your assertions here
  });
});
```

## Key Features

### 1. Environment Switching
Switch between environments using scripts:
```powershell
.\scripts\switch-endpoint.ps1 -Type scim
.\scripts\switch-endpoint.ps1 -Type apiserver
```

### 2. OEM vs Non-OEM Support
Automatically detects and handles OEM/Non-OEM differences:
```typescript
import { isOemEnvironment, getInstitutionId } from '../utils/api-config';

if (isOemEnvironment()) {
  // OEM-specific logic
  const institutionId = getInstitutionId();
}
```

### 3. Validation Utilities
Pre-built validators for common scenarios:
```typescript
// Status validation
ApiValidators.validateResponseStatus(response, 200);

// JSON validation
const body = await ApiValidators.validateJsonResponse(response);

// Required fields
ApiValidators.validateRequiredFields(body, ['id', 'userName'], 'User');

// Field types
ApiValidators.validateFieldTypes(body, {
  'id': 'string',
  'active': 'boolean'
});

// Response time
ApiValidators.validateResponseTime(startTime, 2000, 'Operation');
```

### 4. Endpoint Management
Centralized endpoint definitions:
```typescript
ApiEndpoints.users()           // /obscim/v2/Users or /ApiServer/onbase/SCIM/v2/Users
ApiEndpoints.groups()          // /obscim/v2/Groups
ApiEndpoints.resourceTypes()   // /obscim/v2/ResourceTypes
ApiEndpoints.schemas()         // /obscim/v2/Schemas
ApiEndpoints.serviceProviderConfig()  // /obscim/v2/ServiceProviderConfig
```

### 5. Logging
Clean, structured console output:
```typescript
logApiRequest('GET', endpoint, 'Description');
// Output: [WEB] GET Request: /obscim/v2/Users
//         [NOTE] Description: Retrieve all users
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy and configure your `.env` file:
```bash
cp .env.example .env
```

Required variables:
- `OAUTH_BASE_URL`
- `API_BASE_URL`
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `API_ENDPOINT_TYPE` (scim or apiserver)

### 3. Run Example Tests
```bash
npx playwright test tests/example.spec.ts
```

### 4. Switch to Development Branch
For full test suite:
```bash
git checkout develop
npx playwright test
```

### 5. View Test Reports
```bash
npx playwright show-report
```

## Documentation

- **`README.md`** - Project overview and quick start
- **`GETTING-STARTED.md`** - Detailed setup guide
- **`SCIM-API-TESTING-GUIDE.md`** - SCIM API specifics
- **`ENDPOINT_SWITCHING.md`** - Endpoint configuration guide
- **`ENVIRONMENT-CONFIG.md`** - Environment setup
- **`PARAMETERIZATION-GUIDE.md`** - Test parameterization
- **`OEM-SEARCH-GUIDE.md`** - OEM-specific search patterns
- **`TESTING_ENHANCEMENTS.md`** - Advanced testing features

## Best Practices

### 1. Use Framework Utilities
Always use provided utilities instead of custom implementations:
```typescript
// Good
ApiValidators.validateResponseStatus(response, 200);

// Avoid
expect(response.status()).toBe(200);
```

### 2. Clean Test Data
Use unique identifiers for test data:
```typescript
const uniqueUserName = `testUser_${Date.now()}`;
```

### 3. Proper Error Handling
Handle different response scenarios:
```typescript
if (response.status() === 404) {
  console.log('[WARN] Resource not found');
  return;
}
```

### 4. Descriptive Logging
Use clear, structured log messages:
```typescript
console.log('[SETUP] Initializing test data...');
console.log('[OK] User created with ID: 123');
console.log('[CHECK] Validating response schema...');
console.log('[DONE] Test completed successfully!');
```

## Environment Variables

### Core Variables
```env
# OAuth Configuration
OAUTH_BASE_URL=https://your-domain/identityservice
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-secret
OAUTH_SCOPES=iam.user-catalog iam.user-catalog.read iam.user-catalog.write

# API Configuration
API_BASE_URL=https://your-domain
API_ENDPOINT_TYPE=scim  # or 'apiserver'

# Database (Optional)
DB_SERVER=your-server
DB_NAME=your-database
DB_USER=your-user
DB_PASSWORD=your-password

# Environment Flags
OEM=false  # true for OEM environments
INSTITUTION_ID=102  # Required for OEM
```

## Troubleshooting

### Token Issues
If authentication fails:
1. Verify `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`
2. Check `OAUTH_SCOPES` match server requirements
3. Ensure `OAUTH_BASE_URL` is correct

### Endpoint Issues
If tests can't reach endpoints:
1. Verify `API_ENDPOINT_TYPE` (scim vs apiserver)
2. Check `API_BASE_URL` is accessible
3. Use endpoint switching scripts to change configuration

### Database Issues
If database tests fail:
1. Verify database credentials in `.env`
2. Ensure database is accessible from test machine
3. Check `OEM` and `INSTITUTION_ID` for OEM environments

## Contributing

When adding new tests to the `develop` branch:
1. Follow existing test patterns
2. Use framework utilities
3. Add proper logging
4. Handle OEM/Non-OEM differences
5. Clean up test data
6. Update documentation

## License

MIT License - See LICENSE file for details
