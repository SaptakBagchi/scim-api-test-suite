# OEM Search Guide

## Overview
In OEM (On-Premise Enterprise Manager) environments, users can belong to different institutions. When searching for users, you **must** include the `institutionId` in the filter to get accurate results.

## Non-OEM vs OEM Search Payloads

### Method 1: GET with Query Parameter Filter

#### Non-OEM GET (rdv-010318)
```http
GET /obscim/v2/Users?filter=userName eq "USER1"
```

#### OEM GET (rdv-009275)
```http
GET /obscim/v2/Users?filter=userName eq "TESTUSER1" and institutionid eq "101"
```

### Method 2: POST .search with Request Body

#### Non-OEM POST Search (rdv-010318)
```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:SearchRequest"
  ],
  "filter": "userName eq \"USER1\""
}
```

#### OEM POST Search (rdv-009275)
```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:SearchRequest"
  ],
  "attributes": [
    "displayName",
    "userName"
  ],
  "filter": "userName eq \"USERX\" and institutionid eq \"102\""
}
```

## Key Differences

| Feature | Non-OEM | OEM |
|---------|---------|-----|
| **institutionId in filter** | ❌ Not required | ✅ Required |
| **attributes field** | ❌ Optional | ✅ Recommended |
| **Filter example** | `userName eq "USER1"` | `userName eq "userx" and institutionid eq "102"` |

## Environment Configuration

The test suite automatically detects the environment and adjusts the search payload:

**utils/db-config.ts:**
```typescript
const environmentConfigs = {
  oem: {
    server: 'RDV-009275\\QASQL17LOCAL',
    database: 'LocalOBTesting',
    apiBaseUrl: 'https://rdv-009275.hylandqa.net',
    institutionId: '102' // Default institution for OEM searches
  },
  nonOem: {
    server: 'RDV-010318\\LOCALSQLSERVER22',
    database: 'LocalOBTesting',
    apiBaseUrl: 'https://rdv-010318.hylandqa.net'
    // No institutionId needed
  }
};
```

## Using in Tests

```typescript
import { isOemEnvironment, getInstitutionId } from '../utils/db-config';

// Build filter based on environment
const isOem = isOemEnvironment();
const institutionId = getInstitutionId();

let filter = `userName eq "${searchUsername}"`;

// For OEM environments, add institutionId to the filter
if (isOem && institutionId) {
  filter += ` and institutionid eq "${institutionId}"`;
  console.log(`🏢 OEM Environment: Adding institutionId=${institutionId} to search filter`);
}

const requestBody: any = {
  schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
  filter: filter
};

// Add attributes for OEM
if (isOem) {
  requestBody.attributes = ["displayName", "userName"];
}
```

## Example Test User: USERX

In the OEM environment (rdv-009275), user USERX exists with:
- **userName**: "USERX"
- **institutionId**: "102"
- **usercode**: "9882"
- **ID**: 164

### Non-OEM Search (Will work)
```bash
npx playwright test --grep "Get User with ID 164"
```

### OEM Search (Requires institutionId)
```bash
$env:OEM = "true"; npx playwright test --grep "Search Users"
```

## Running Tests

```powershell
# Non-OEM - Simple username search
npx playwright test --grep "Search Users by Username"

# OEM - With institutionId filter
$env:OEM = "true"; npx playwright test --grep "Search Users by Username"
```

## Why institutionId is Required in OEM

In OEM environments:
- Multiple institutions can exist in the same database
- Users can have the same username across different institutions
- The `institutionId` acts as a tenant identifier
- Without it, searches may return multiple users or incorrect results

## Institution IDs in Test Database

Based on the database, common institution IDs:
- **99**: System/Administrator accounts
- **101**: Standard institution 1
- **102**: Standard institution 2 (default for test users)
