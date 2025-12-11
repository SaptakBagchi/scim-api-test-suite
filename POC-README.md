# SCIM API POC Test Suite

## Overview
This is a **Proof of Concept (POC)** branch with simplified test cases for demonstration purposes.

## POC Test Cases (5 Tests)

### User Operations (4 tests)
1. **POC-1: Get User with ID** - GET operation to retrieve a user
2. **POC-2: Create User** - POST operation to create a new user
3. **POC-3: Update User (PUT)** - PUT operation to update an existing user
4. **POC-4: Delete User** - DELETE operation to remove a user

### Group Operations (1 test)
5. **POC-5: Get Group with ID** - GET operation to retrieve a group

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run POC Tests
```bash
# Run only POC tests
npx playwright test tests/scim-api-poc.spec.ts

# Run with UI mode
npx playwright test tests/scim-api-poc.spec.ts --ui

# Run with headed browser
npx playwright test tests/scim-api-poc.spec.ts --headed
```

### 3. View Test Report
```bash
npx playwright show-report
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

## Notes
- POC tests use the same authentication and configuration as the full suite
- Environment variables are configured in `.env` file
- POC tests are designed for quick validation and demonstration
- For complete test coverage, use the full test suite on the `main` branch

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
