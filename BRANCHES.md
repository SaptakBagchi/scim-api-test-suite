# Branch Structure & Usage Guide

## Overview

This repository is organized into three branches, each serving a specific purpose:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCIM API Test Suite                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│    main     │    │   develop    │    │      poc       │
│             │    │              │    │                │
│ Framework   │    │  Full Suite  │    │  Demo Suite    │
│   Only      │    │  (28 tests)  │    │  (5-6 tests)   │
│             │    │              │    │                │
│  Utilities  │    │  Active Dev  │    │  Showcase      │
│  + Configs  │    │              │    │                │
└─────────────┘    └──────────────┘    └────────────────┘
```

---

## Branch Details

### 🔵 `main` Branch - Framework Only

**Purpose:** Clean, reusable test framework without actual tests

**Contents:**
- ✅ Core utilities (`utils/api-config.ts`, `utils/db-config.ts`)
- ✅ Configuration files (`.env`, `playwright.config.ts`, `global-setup.ts`)
- ✅ Scripts (`scripts/switch-endpoint.ps1`, etc.)
- ✅ Documentation (all `.md` files)
- ✅ Example template (`tests/example.spec.ts`)
- ❌ NO actual test implementations

**Use Cases:**
- Starting point for new projects
- Framework reference
- Documentation hub
- Template for creating new test suites

**Test Files:**
```
tests/
└── example.spec.ts  (2 example tests showing framework usage)
```

**How to Use:**
```bash
git checkout main
npx playwright test tests/example.spec.ts
```

---

### 🟢 `develop` Branch - Full Test Suite

**Purpose:** Complete test suite for active development and testing

**Contents:**
- ✅ All framework components from `main`
- ✅ Full test suite with 28+ tests
- ✅ All SCIM operations (Users, Groups, Schemas, etc.)
- ✅ Multiple test files for organization

**Test Files:**
```
tests/
├── scim-api.spec.ts       (28 tests - all SCIM operations)
├── scim-api-full.spec.ts  (28 tests - copy for reference)
└── scim-api-poc.spec.ts   (7 tests - POC subset)
```

**Test Coverage:**
- **User Operations (15 tests)**
  - Get All Users, Get User by ID, Create, Update (PUT/PATCH), Delete
  - Search operations, Pagination, Filtering
  
- **Group Operations (7 tests)**
  - Get All Groups, Get by ID, Create, Update, Delete
  - Pagination, Attribute exclusion
  
- **Configuration (6 tests)**
  - Service Provider Config
  - Schemas, Resource Types
  - Health Check, Diagnostics

**How to Use:**
```bash
git checkout develop

# Run all tests
npm test

# Run specific test file
npx playwright test tests/scim-api.spec.ts

# Run with specific environment
$env:OEM = "false"; $env:ENDPOINT_TYPE = "apiserver"
npx playwright test

# View report
npx playwright show-report
```

**Typical Workflow:**
1. Make changes/add new tests in `develop`
2. Test locally
3. Push to `develop` branch
4. Merge to `main` when framework changes are needed
5. Cherry-pick selected tests to `poc` for demos

---

### 🟡 `poc` Branch - Showcase/Demo Tests

**Purpose:** Proof of Concept with selected tests for demonstration

**Contents:**
- ✅ All framework components from `main`
- ✅ Carefully selected 5-6 tests showcasing key features
- ✅ Clean, emoji-free output for Windows PowerShell
- ✅ Representative samples of different operations

**Test Files:**
```
tests/
├── scim-api-poc.spec.ts  (7 showcase tests)
└── scim-api.spec.ts      (28 tests - for reference)
```

**Selected Tests:**
1. **Get Groups with Pagination** - Shows pagination handling
2. **Get All Users** - Demonstrates list operations
3. **Create User** - POST operation example
4. **Update User (PUT)** - Full replacement update
5. **Delete User** - DELETE operation
6. **Get Group with ID 1** - Single resource retrieval
7. **Get All Groups** - List operation with validation

**Why These Tests?**
- Cover all CRUD operations (Create, Read, Update, Delete)
- Show pagination patterns
- Demonstrate both Users and Groups
- Fast execution (~9 seconds)
- Clean, professional output

**How to Use:**
```bash
git checkout poc

# Run POC tests (non-OEM, API Server)
$env:OEM = "false"; $env:ENDPOINT_TYPE = "apiserver"
npx playwright test tests/scim-api-poc.spec.ts --reporter=line

# Run with HTML report
npx playwright test tests/scim-api-poc.spec.ts --reporter=html
npx playwright show-report
```

**Output Example:**
```
[START] Setting up global test configuration...
[OK] Environment variables validated
[URL] OAuth Base URL: https://rdv-009275.hylandqa.net/identityservice
[WEB] API Base URL: https://rdv-009275.hylandqa.net
[OK] Token obtained successfully
...
  7 passed (9.2s)
```

---

## Workflow Recommendations

### For Framework Development
```bash
# Work in main branch
git checkout main

# Make framework changes (utilities, configs)
# Test with example.spec.ts
npx playwright test tests/example.spec.ts

# Commit and push
git add .
git commit -m "Update framework: description"
git push origin main

# Merge changes to other branches
git checkout develop
git merge main
git push origin develop

git checkout poc
git merge main
git push origin poc
```

### For Adding New Tests
```bash
# Always work in develop branch
git checkout develop

# Add/modify tests in scim-api.spec.ts or scim-api-full.spec.ts
# Test locally
npx playwright test

# Commit and push
git add tests/
git commit -m "Add new test: description"
git push origin develop
```

### For Updating POC Tests
```bash
# Start from develop
git checkout develop

# Identify tests to showcase
# Copy selected tests to poc branch

git checkout poc

# Update scim-api-poc.spec.ts with selected tests
# Test to ensure they work
npx playwright test tests/scim-api-poc.spec.ts

# Commit and push
git commit -m "Update POC showcase tests"
git push origin poc
```

---

## Quick Reference

### Switching Branches
```bash
# Framework only
git checkout main

# Full test suite
git checkout develop  

# Demo/POC tests
git checkout poc
```

### Running Tests by Branch

**Main (Framework Examples):**
```bash
git checkout main
npx playwright test tests/example.spec.ts
```

**Develop (Full Suite):**
```bash
git checkout develop
npx playwright test tests/scim-api.spec.ts
# or
npx playwright test tests/scim-api-full.spec.ts
```

**POC (Showcase):**
```bash
git checkout poc
npx playwright test tests/scim-api-poc.spec.ts
```

---

## File Comparison

| Component | main | develop | poc |
|-----------|------|---------|-----|
| Framework Utilities | ✅ | ✅ | ✅ |
| Configs (.env, playwright.config) | ✅ | ✅ | ✅ |
| Scripts | ✅ | ✅ | ✅ |
| Documentation | ✅ | ✅ | ✅ |
| Example Tests | ✅ (2) | ❌ | ❌ |
| Full Test Suite | ❌ | ✅ (28) | ✅ (reference) |
| POC Tests | ❌ | ✅ (subset) | ✅ (7) |

---

## Best Practices

1. **Framework Changes** → Always make in `main`, then merge to others
2. **New Tests** → Always add to `develop` first
3. **POC Updates** → Cherry-pick from `develop` to `poc`
4. **Never** → Don't add actual tests directly to `main`
5. **Documentation** → Update in `main`, propagate to others

---

## Branch Protection (Recommended)

If using GitHub/GitLab:
- **main**: Protected, require PR reviews
- **develop**: Allow direct commits for active development
- **poc**: Protected, require PR reviews (keep clean for demos)

---

## Questions?

- Framework usage: See `FRAMEWORK.md`
- SCIM API details: See `SCIM-API-TESTING-GUIDE.md`
- Environment setup: See `GETTING-STARTED.md`
- Endpoint switching: See `ENDPOINT_SWITCHING.md`
