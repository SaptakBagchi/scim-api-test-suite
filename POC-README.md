# SCIM API POC Test Suite

## Overview
This is the **POC (Proof of Concept)** branch with **5 tests selected from the main branch's 28 tests**. These are **exact copies** from the main branch, not simplified versions.

**Philosophy**: POC = Main - 23 tests

The POC branch is a showcase with fewer tests to demonstrate the framework capabilities. Everything is identical to main except the number of tests.

## POC Test Cases (5 Tests)

These are exact copies of the following tests from main branch:

### User Operations (4 tests)
1. **Test #2: Get User with ID 106** - Retrieve a specific user by ID
2. **Test #6: Create User** - Create a new user in the system  
3. **Test #10: Update User (PUT)** - Complete replacement of an existing user
4. **Test #12: Delete User (DELETE)** - Delete a user from the system

### Group Operations (1 test)
5. **Test #14: Get Group with ID 1** - Retrieve a specific group (MANAGER)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Edit .env file with your credentials
```

### 3. Run POC Tests (Same Commands as Main Branch)

**Non-OEM with SCIM endpoint:**
```powershell
$env:OEM = "false"; $env:ENDPOINT_TYPE = "scim"; npx playwright test tests/scim-api-poc.spec.ts --reporter=line
```

**Non-OEM with API Server endpoint:**
```powershell
$env:OEM = "false"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test tests/scim-api-poc.spec.ts --reporter=line
```

**OEM with SCIM endpoint:**
```powershell
$env:OEM = "true"; $env:ENDPOINT_TYPE = "scim"; npx playwright test tests/scim-api-poc.spec.ts --reporter=line
```

**OEM with API Server endpoint:**
```powershell
$env:OEM = "true"; $env:ENDPOINT_TYPE = "apiserver"; npx playwright test tests/scim-api-poc.spec.ts --reporter=line
```

### 4. View Test Report
```bash
npm run report
```

## File Structure (POC Branch)
```
scim-api-test-suite/
├── tests/
│   ├── scim-api.spec.ts        # Full test suite (28 tests)
│   └── scim-api-poc.spec.ts    # POC test suite (5 tests) ⭐
├── utils/
│   ├── api-config.ts           # API utilities
│   └── db-config.ts            # Database utilities
├── playwright.config.ts        # Playwright configuration
├── POC-README.md              # This file ⭐
└── README.md                  # Main documentation
```

## Test Coverage

### CRUD Operations Demonstrated
- ✅ **Create** - POST `/Users` (Test 2)
- ✅ **Read** - GET `/Users/{id}` (Test 1)
- ✅ **Update** - PUT `/Users/{id}` (Test 3)
- ✅ **Delete** - DELETE `/Users/{id}` (Test 4)
- ✅ **Read Group** - GET `/Groups/{id}` (Test 5)

## Key Features
- ✨ Simplified test suite for quick demonstration
- 🎯 Covers all major HTTP methods (GET, POST, PUT, DELETE)
- 📊 Clear test output with emojis and structured logging
- 🔄 Works in both standard and OEM environments
- ⚡ Fast execution (~30 seconds for all 5 tests)

## Switching Between Full and POC Tests

### Run Full Test Suite (28 tests)
```bash
npx playwright test tests/scim-api.spec.ts
```

### Run POC Test Suite (5 tests)
```bash
npx playwright test tests/scim-api-poc.spec.ts
```

## 📊 Comparison with Main Branch

| Aspect | Main Branch | POC Branch |
|--------|-------------|------------|
| Test Count | 28 tests | 5 tests |
| Test File | `scim-api.spec.ts` | `scim-api-poc.spec.ts` |
| Execution Time | ~45-60 seconds | ~5-6 seconds |
| Commands | ✅ **Same** | ✅ **Same** |
| Scripts | ✅ **Same** | ✅ **Same** |
| Framework | ✅ **Same** | ✅ **Same** |
| Purpose | Full regression | Quick smoke test |

## 🎯 Philosophy

**POC Branch = Main Branch - 23 Tests**

Everything else remains identical:
- Same commands (`node scripts/switch-endpoint.js`, etc.)
- Same framework structure
- Same utilities and configuration
- Just fewer tests for faster validation

## 📖 For More Details

- Full documentation: [GETTING-STARTED.md](./GETTING-STARTED.md)
- Main branch: [Main README](./README.md)
- Endpoint switching: [ENDPOINT_SWITCHING.md](./ENDPOINT_SWITCHING.md)

## Switching Branches

### Switch to Main Branch (Full Test Suite)
```bash
git checkout main
```

### Switch to POC Branch (Simplified Tests)
```bash
git checkout poc
```

## Need Help?
- 📖 See `GETTING-STARTED.md` for beginner-friendly guide
- 📄 See `README.md` for complete documentation
- 🔧 See `SCIM-API-TESTING-GUIDE.md` for detailed test information
