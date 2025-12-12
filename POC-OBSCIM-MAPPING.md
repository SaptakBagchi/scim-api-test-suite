# POC Branch - OBSCIM Test Mapping

**Branch**: poc  
**Last Updated**: December 12, 2025  
**Total POC Tests**: 7  
**OBSCIM Coverage**: 2/17 OBSCIM Requirements (12%)

---

## Overview

The POC branch contains a **showcase suite of 7 carefully selected tests** from the main test suite (which has 35 tests total). These tests demonstrate the core SCIM 2.0 API functionality and are now aligned with OBSCIM requirements from JIRA.

---

## OBSCIM Requirements Covered in POC

| OBSCIM ID | Requirement Summary | POC Tests | Test Names |
|-----------|-------------------|-----------|------------|
| **OBSCIM-333** | Verify the updated User endpoint for OBSCIM as per SCIM 2.0 specification | 4 tests | Get All Users, Create User, Update User (PUT), Delete User (DELETE) |
| **OBSCIM-343** | Verify the updated Group endpoint for OBSCIM as per SCIM 2.0 specification | 3 tests | Get Group with ID 1, Get All Groups, Get Groups with Pagination |

---

## Detailed Test Mapping

### OBSCIM-333: User Endpoint Tests (4 tests)

| Test # | Test Name | Line | Endpoint | Method | Purpose |
|--------|-----------|------|----------|--------|---------|
| 1 | Get All Users - OBSCIM-333 | ~70 | /Users | GET | Retrieve all users, validate SCIM ListResponse |
| 2 | Create User - OBSCIM-333 | ~155 | /Users | POST | Create new user, validate SCIM User schema |
| 3 | Update User (PUT) - OBSCIM-333 | ~269 | /Users/{id} | PUT | Full user replacement, validate update |
| 4 | Delete User (DELETE) - OBSCIM-333 | ~435 | /Users/{id} | DELETE | Delete user, expect 204 No Content |

**Coverage**: Covers core User CRUD operations (Create, Read, Update, Delete)

---

### OBSCIM-343: Group Endpoint Tests (3 tests)

| Test # | Test Name | Line | Endpoint | Method | Purpose |
|--------|-----------|------|----------|--------|---------|
| 5 | Get Group with ID 1 - OBSCIM-343 | ~556 | /Groups/1 | GET | Retrieve specific group (MANAGER) |
| 6 | Get All Groups - OBSCIM-343 | ~612 | /Groups | GET | Retrieve all groups, validate SCIM ListResponse |
| 7 | Get Groups with Pagination - OBSCIM-343 | ~672 | /Groups?startIndex=1&count=2 | GET | Test pagination with startIndex and count |

**Coverage**: Covers basic Group read operations and pagination

---

## POC vs Full Suite Comparison

| Metric | POC Branch | Develop Branch | Notes |
|--------|------------|----------------|-------|
| **Total Tests** | 7 | 35 | POC has 20% of full suite |
| **OBSCIM Requirements** | 2 | 14 | POC covers 14% of completed requirements |
| **User Tests** | 4 | 12 | Includes: GET, POST, PUT, DELETE |
| **Group Tests** | 3 | 8 | Includes: GET by ID, GET all, Pagination |
| **Schema/Config Tests** | 0 | 7 | Not included in POC |
| **Filter Tests** | 0 | 2 | Not included in POC |
| **Special Validation Tests** | 0 | 6 | Not included in POC |

---

## What's NOT Covered in POC

### OBSCIM Requirements Not in POC:
- **OBSCIM-331**: ResourceType endpoint validation
- **OBSCIM-334**: Schema endpoint validation
- **OBSCIM-342**: ServiceProviderConfig endpoint
- **OBSCIM-329**: Username filter variations
- **OBSCIM-330**: Both /schemas endpoint variants
- **OBSCIM-332**: Username casing consistency
- **OBSCIM-335**: Group displayName filter
- **OBSCIM-337**: Schema camelCase validation
- **OBSCIM-338**: Detailed User/Group schema validation
- **OBSCIM-341**: Detailed ResourceType validation
- **OBSCIM-336, 340, 344, 345, 339**: Infrastructure-dependent tests (pending in all branches)

### Missing Test Operations:
- **User Operations**: PATCH (partial update)
- **Group Operations**: POST (create), PUT (update), PATCH (partial update), DELETE
- **Search Operations**: User search by username, by ID, multiple IDs
- **Filter Operations**: With/without quotes, case variations
- **Schema Endpoints**: GET /Schemas, /ResourceTypes, /ServiceProviderConfig
- **Advanced Tests**: Username casing, schema structure validation, resourceType validation

---

## Test Execution Guide

### Run All POC Tests
```bash
# Run all 7 POC tests
npx playwright test tests/scim-api-poc.spec.ts --reporter=html
```

### Run by OBSCIM Requirement
```bash
# Run all User tests (OBSCIM-333)
npx playwright test tests/scim-api-poc.spec.ts --grep "OBSCIM-333" --reporter=line

# Run all Group tests (OBSCIM-343)
npx playwright test tests/scim-api-poc.spec.ts --grep "OBSCIM-343" --reporter=line
```

### Run Individual Tests
```bash
# Run specific test by name
npx playwright test tests/scim-api-poc.spec.ts --grep "Get All Users" --reporter=line
npx playwright test tests/scim-api-poc.spec.ts --grep "Create User" --reporter=line
```

---

## POC Test Results Summary

### Expected Results:
- ✅ **7 passed** in Non-OEM environments
- ✅ **6 passed, 1 skipped** in OEM environments
  - Skipped: Create User (requires institution provisioning in OEM)

### Test Coverage by Operation:
| Operation | Users | Groups | Total |
|-----------|-------|--------|-------|
| **GET (List)** | 1 | 2 | 3 |
| **GET (By ID)** | 0 | 1 | 1 |
| **POST (Create)** | 1 | 0 | 1 |
| **PUT (Update)** | 1 | 0 | 1 |
| **DELETE** | 1 | 0 | 1 |
| **Total** | 4 | 3 | 7 |

---

## Alignment with Main Branch

### Test Selection Criteria:
The POC tests were selected to demonstrate:
1. **Core CRUD Operations**: Basic create, read, update, delete
2. **Both Major Endpoints**: Users and Groups
3. **Pagination Support**: Demonstrate SCIM pagination
4. **Real-world Scenarios**: Practical use cases
5. **OEM Compatibility**: Tests work in both OEM and Non-OEM environments

### Differences from Develop Branch:
| Aspect | POC Branch | Develop Branch |
|--------|------------|----------------|
| **Test Count** | 7 tests | 35 tests |
| **File Name** | scim-api-poc.spec.ts | scim-api.spec.ts |
| **Focus** | Showcase/Demo | Complete coverage |
| **OBSCIM Refs** | ✅ Added | ✅ Added |
| **Documentation** | POC-OBSCIM-MAPPING.md | OBSCIM-TEST-MAPPING.md |

---

## Recommendations

### For Production Use:
- ✅ Use **develop branch** for complete OBSCIM coverage
- ✅ Use **POC branch** for demos, presentations, or initial testing

### For Extending POC:
To add more OBSCIM coverage to POC, consider adding:
1. **PATCH User** (OBSCIM-333) - Partial user updates
2. **Filter Users** (OBSCIM-329) - Filter with quotes/case variations
3. **Get Schemas** (OBSCIM-334) - Schema endpoint validation
4. **Create Group** (OBSCIM-343) - Group creation

### For Complete OBSCIM Coverage:
Switch to **develop branch** which provides:
- 14/17 OBSCIM requirements automated (82%)
- 35 comprehensive tests
- Advanced validation tests
- Complete CRUD for Users and Groups
- Schema and configuration validation

---

## Quick Reference

| Info | Value |
|------|-------|
| **Branch** | poc |
| **Test File** | tests/scim-api-poc.spec.ts |
| **Total Tests** | 7 |
| **OBSCIM Coverage** | 2 requirements (OBSCIM-333, OBSCIM-343) |
| **Lines of Code** | ~728 lines |
| **Test Type** | Showcase/Demo suite |
| **Full Suite** | develop branch (35 tests, 3,360+ lines) |

---

**Document Purpose**: Map POC branch tests to OBSCIM JIRA requirements  
**Related Docs**: 
- Full coverage: OBSCIM-TEST-MAPPING.md (develop branch)
- POC README: POC-README.md
**Test File**: `tests/scim-api-poc.spec.ts` (~728 lines)  
**Branch**: poc  
**Repository**: scim-api-test-suite
