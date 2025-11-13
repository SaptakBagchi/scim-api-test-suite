# Dual Endpoint Testing: SCIM vs API Server

This project now supports testing both SCIM and API Server endpoints with the same test suite by simply changing a configuration setting.

## Endpoint Types

### SCIM Endpoints
- **Base Path**: `{{IdSBaseURI}}/obscim/v2`
- **Full URL**: `https://rdv-010318.hylandqa.net/obscim/v2`
- **Use Case**: Testing direct SCIM API endpoints

### API Server Endpoints  
- **Base Path**: `{{IdSBaseURI}}/ApiServer/onbase/SCIM/v2`
- **Full URL**: `https://rdv-010318.hylandqa.net/ApiServer/onbase/SCIM/v2`
- **Use Case**: Testing SCIM endpoints through API Server

## How to Switch Between Endpoints

### Method 1: Using PowerShell Script (Recommended)
```powershell
# Switch to SCIM endpoints
.\scripts\switch-endpoint.ps1 scim

# Switch to API Server endpoints  
.\scripts\switch-endpoint.ps1 apiserver

# Check current configuration
.\scripts\switch-endpoint.ps1 status
```

### Method 2: Using Node.js Script
```bash
# Switch to SCIM endpoints
node scripts/switch-endpoint.js scim

# Switch to API Server endpoints
node scripts/switch-endpoint.js apiserver

# Check current configuration  
node scripts/switch-endpoint.js status
```

### Method 3: Manual .env Edit
Edit the `.env` file directly:
```env
# For SCIM endpoints
API_ENDPOINT_TYPE=scim

# For API Server endpoints
API_ENDPOINT_TYPE=apiserver
```

## Running Tests

After switching endpoint types, run your tests as usual:
```powershell
# Run all tests
npx playwright test --workers=1 --reporter=line

# Run specific test groups
npx playwright test --workers=1 --grep="User" --reporter=line
npx playwright test --workers=1 --grep="ServiceProviderConfig" --reporter=line
```

## Configuration Details

The endpoint configuration is managed in `utils/api-config.ts`:

- **Current Type**: Controlled by `API_ENDPOINT_TYPE` environment variable
- **Available Types**: `'scim'` | `'apiserver'`
- **Paths**: Defined in `ProjectConfig.api.endpoints`
- **Dynamic Resolution**: `getCurrentEndpointPath()` function returns active path

## Test Output

When running tests, you'll see the current endpoint configuration:
```
🔧 API Endpoint Configuration:
📍 Current Type: SCIM
🌐 Base URL: https://rdv-010318.hylandqa.net  
📁 Endpoint Path: /obscim/v2
✅ Full URL: https://rdv-010318.hylandqa.net/obscim/v2
```

## Validation

The system automatically validates:
- ✅ Endpoint type is valid (`scim` or `apiserver`)
- ✅ Endpoint path is configured
- ✅ Configuration loads correctly before tests run

This allows you to test the same SCIM operations against both direct SCIM endpoints and API Server-routed endpoints with identical test cases.