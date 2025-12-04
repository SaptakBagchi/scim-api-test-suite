# Environment-Based Database Configuration

This test suite supports OEM and Non-OEM environments with automatic database and API configuration.

## Supported Environments

### Non-OEM Environment (Default - RDV-010318)
**Configuration:**
- API URL: `https://rdv-010318.hylandqa.net`
- OAuth URL: `https://rdv-010318.hylandqa.net/identityservice`
- Database Server: `RDV-010318\LOCALSQLSERVER22`
- Database: `LocalOBTesting`
- User: `hsi`
- Password: `wstinol`

### OEM Environment (RDV-009275)
**Configuration:**
- API URL: `https://rdv-009275.hylandqa.net`
- OAuth URL: `https://rdv-009275.hylandqa.net/identityservice`
- Database Server: `RDV-009275\QASQL17LOCAL`
- Database: `LocalOBTesting`
- User: `hsi`
- Password: `wstinol`

## How to Switch Environments

### Method 1: Use OEM Parameter (Recommended ⭐)
Simply set the `OEM` environment variable when running tests:

```powershell
# Run in Non-OEM environment (default - no parameter needed)
npx playwright test

# Run in OEM environment
$env:OEM = "true"; npx playwright test

# Run in OEM with specific endpoint type
$env:OEM = "true"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test

# Alternative OEM values (all work the same)
$env:OEM = "1"; npx playwright test
$env:OEM = "yes"; npx playwright test
$env:OEM = "oem"; npx playwright test
```

### Method 2: Run Specific Tests
```powershell
# Run specific test in OEM environment
$env:OEM = "true"; npx playwright test --grep "Get User with ID"

# Run all User tests in OEM
$env:OEM = "true"; npx playwright test --grep "User"

# Run all Group tests in OEM with database validation
$env:OEM = "true"; npx playwright test --grep "Group"
```

### Method 3: Combined Parameters
```powershell
# OEM environment with SCIM endpoint
$env:OEM = "true"; $env:ENDPOINT_TYPE = "scim"; npx playwright test

# OEM environment with API Server endpoint
$env:OEM = "true"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test

# Non-OEM with API Server endpoint (default)
$env:ENDPOINT_TYPE = "apiserver"; npx playwright test

# Non-OEM with SCIM endpoint (default)
$env:ENDPOINT_TYPE = "scim"; npx playwright test
```

## How It Works

1. **OEM Detection**: The suite checks the `OEM` environment variable
   - If `OEM=true` (or `1`, `yes`, `oem`), it uses the OEM configuration (rdv-009275)
   - Otherwise, it uses the Non-OEM configuration (rdv-010318)

2. **Automatic Configuration**: Based on the OEM parameter, the suite automatically sets:
   - `API_BASE_URL` - for API requests
   - `OAUTH_BASE_URL` - for authentication
   - Database connection parameters (server, database, user, password)

3. **Environment Logging**: When tests run, you'll see which environment is active:
   ```
   🔧 Environment: OEM (rdv-009275)
   📍 API URL: https://rdv-009275.hylandqa.net
   🗄️  Database: RDV-009275\QASQL17LOCAL\LocalOBTesting
   ```

## Quick Reference

| Environment | Command |
|-------------|---------|
| Non-OEM (Default) | `npx playwright test` |
| OEM | `$env:OEM = "true"; npx playwright test` |
| OEM + API Server | `$env:OEM = "true"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test` |
| OEM + SCIM | `$env:OEM = "true"; $env:ENDPOINT_TYPE = "scim"; npx playwright test` |
| Non-OEM + API Server | `$env:ENDPOINT_TYPE = "apiserver"; npx playwright test` |

## Verification

To verify the configuration is working correctly, run a simple test:

```powershell
# Test Non-OEM environment
$env:ENDPOINT_TYPE = "apiserver"; npx playwright test --grep "Get User with ID" --reporter=line

# Test OEM environment
$env:OEM = "true"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test --grep "Get User with ID" --reporter=line
```

You should see successful database validation messages confirming the environment is configured correctly.

## Adding New Environments

To add a new environment, edit `utils/db-config.ts` and update the `environmentConfigs` object:

```typescript
const environmentConfigs = {
  oem: {
    server: 'RDV-009275\\QASQL17LOCAL',
    database: 'LocalOBTesting',
    user: 'hsi',
    password: 'wstinol',
    apiBaseUrl: 'https://rdv-009275.hylandqa.net',
    oauthBaseUrl: 'https://rdv-009275.hylandqa.net/identityservice'
  },
  nonOem: {
    server: 'RDV-010318\\LOCALSQLSERVER22',
    database: 'LocalOBTesting',
    user: 'hsi',
    password: 'wstinol',
    apiBaseUrl: 'https://rdv-010318.hylandqa.net',
    oauthBaseUrl: 'https://rdv-010318.hylandqa.net/identityservice'
  }
};
```

## Troubleshooting

**Issue**: Tests are running against the wrong environment
**Solution**: Check that the `OEM` parameter is set correctly. The suite logs the active environment at startup.

**Issue**: Database connection fails
**Solution**: Verify the database server is accessible and the connection details are correct in `utils/db-config.ts`.

**Issue**: API calls fail
**Solution**: Ensure the API base URL is correct and the server is running.
