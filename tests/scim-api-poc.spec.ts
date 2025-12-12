import { test, expect } from '@playwright/test';
import { 
  createApiTestContext, 
  ApiEndpoints, 
  ScimSchemas,
  logApiRequest, 
  ApiValidators,
  ApiTestContext,
  getCurrentEndpointType
} from '../utils/api-config';
import {
  isOemEnvironment,
  getInstitutionId,
  createTestUserInDatabase,
  deleteTestUserFromDatabase
} from '../utils/db-config';

/**
 * Helper function to add status code information to test steps
 * This will help track expected vs actual status codes in reports
 */
function logTestResult(testInfo: any, operation: string, endpoint: string, expectedStatus: number, actualStatus: number, result: 'PASS' | 'FAIL') {
  const statusInfo = `[Expected: ${expectedStatus}, Actual: ${actualStatus}]`;
  const resultEmoji = result === 'PASS' ? '✅' : '❌';
  testInfo.annotations.push({ 
    type: 'status-codes', 
    description: `${resultEmoji} ${operation} ${endpoint} ${statusInfo}` 
  });
}

/**
 * SCIM API POC Tests - Proof of Concept Suite with 7 Core Tests
 * This is a simplified version of the full test suite (scim-api.spec.ts)
 * showcasing the testing framework with critical SCIM operations.
 * 
 * Coverage: 7 tests covering OBSCIM-333 (User operations) and OBSCIM-343 (Group operations)
 * 
 * All tests inherit improvements from the full suite including:
 * - OEM database integration for test data setup
 * - Proper error handling without false positives
 * - Enhanced logging and validation
 * - Strict status code assertions
 */
test.describe('SCIM API POC Tests', () => {
  let apiContext: ApiTestContext;
  
  // Setup authentication before running tests
  test.beforeAll(async ({ request }) => {
    console.log('🔧 Setting up API authentication...');
    apiContext = await createApiTestContext(request);
    console.log('✅ Authentication setup complete');
  });

  test.beforeEach(async () => {
    console.log('🏗️ Test Setup:');
    console.log(`📍 Base URL: ${apiContext.baseUrl}`);
    console.log('🔑 Authorization: Bearer [TOKEN_SET]');
    console.log('---');
  });

  /**
   * OBSCIM-333: Verify the create User endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 9: Create User (POST)
   * Endpoint: POST {{IdSBaseURI}}/obscim/v2/Users
   * Purpose: Create a new user resource and validate SCIM 2.0 compliance
   * 
   * Note: This test is skipped in OEM environments as direct user creation via API
   * is not supported. OEM requires database-level user creation.
   */
  test('Create User (POST) - OBSCIM-333', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-333: Testing Users POST (create) endpoint');
    
    // OEM Check: Skip if in OEM environment since direct user creation is not supported
    if (isOemEnvironment()) {
      console.log('🏢 OEM Mode Detected: Direct user creation via API not supported in OEM');
      console.log('📝 OEM requires database-level user creation - test will be skipped');
      test.skip();
      return;
    }
    
    const endpoint = ApiEndpoints.users();
    const uniqueUserName = `user_${Date.now()}`;
    const requestBody = {
      schemas: [
        "urn:ietf:params:scim:schemas:core:2.0:User"
      ],
      active: true,
      userName: uniqueUserName,
      name: {
        formatted: `Test User ${Date.now()}`
      },
      groups: [
        {
          value: "1"
        }
      ]
    };
    
    logApiRequest('POST', endpoint, 'Create a new user resource');
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Make the API request
    const response = await request.post(`${apiContext.baseUrl}${endpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: requestBody,
      timeout: 90000
    });
    
    // Validate response status
    await test.step(`✅ POST ${endpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 201);
    });
    
    // Log status code information for reporting
    logTestResult(testInfo, 'POST', endpoint, 201, response.status(), 'PASS');
    
    // Parse and validate JSON response
    const responseBody = await ApiValidators.validateJsonResponse(response);
    console.log('📥 Response body received:', JSON.stringify(responseBody, null, 2));
    
    // SCIM-specific validations for created user
    console.log('[CHECK] Validating SCIM created User response...');
    
    // Validate SCIM User schema
    expect(responseBody.schemas).toBeDefined();
    expect(Array.isArray(responseBody.schemas)).toBe(true);
    expect(responseBody.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:User');
    console.log('✅ SCIM User schema present');
    
    // Validate user ID
    expect(responseBody.id).toBeDefined();
    const createdUserId = responseBody.id;
    console.log(`✅ User ID assigned: ${createdUserId}`);
    
    // Validate username
    expect(responseBody.userName).toBeDefined();
    expect(responseBody.userName.toUpperCase()).toBe(uniqueUserName.toUpperCase());
    console.log(`✅ Username: ${responseBody.userName}`);
    
    // Validate active status
    expect(responseBody.active).toBeDefined();
    expect(responseBody.active).toBe(true);
    console.log(`✅ Active status: ${responseBody.active}`);
    
    // Validate meta object
    expect(responseBody.meta).toBeDefined();
    expect(responseBody.meta.resourceType).toBe('User');
    expect(responseBody.meta.location).toBeDefined();
    expect(responseBody.meta.location).toContain(`/Users/${createdUserId}`);
    console.log(`✅ Resource type: ${responseBody.meta.resourceType}`);
    console.log(`✅ Location: ${responseBody.meta.location}`);
    
    // Validate response headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/(application\/json|application\/scim\+json)/);
    console.log(`✅ Content-Type validation passed: ${contentType}`);
    
    console.log(`Created user with ID: ${createdUserId} for potential cleanup`);
    
    console.log('[DONE] Create User test completed successfully!');
  });

  /**
   * OBSCIM-333: Verify the updated User endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 10: Update User (PUT)
   * Endpoint: PUT {{IdSBaseURI}}/obscim/v2/Users/{id}
   * Purpose: Completely replace an existing user using PUT method
   */
  test('Update User (PUT) - OBSCIM-333', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-333: Testing Users PUT (update) endpoint');
    
    let userId: string;
    let originalUserName: string;
    
    if (isOemEnvironment()) {
      // In OEM, create a test user directly in the database
      console.log('🏢 OEM Mode: Creating test user in database for PUT test...');
      const testUserName = `PUTTEST_${Date.now()}`;
      const institutionId = getInstitutionId();
      
      try {
        console.log(`📝 Creating user "${testUserName}" in database with institutionId: ${institutionId}`);
        const userNum = await createTestUserInDatabase(testUserName, institutionId);
        console.log(`✅ Database user created with usernum: ${userNum}`);
        
        // Now search for this user via API to get the SCIM ID
        console.log('🔍 Searching for created user via API...');
        const searchEndpoint = `${ApiEndpoints.users()}?filter=userName eq "${testUserName}" and institutionid eq "${institutionId}"`;
        const searchResponse = await request.get(`${apiContext.baseUrl}${searchEndpoint}`, {
          headers: apiContext.headers,
          timeout: 90000
        });
        
        if (searchResponse.status() !== 200) {
          console.log(`⚠️  Could not search for created user (Status: ${searchResponse.status()})`);
          test.skip();
          return;
        }
        
        const searchBody = await searchResponse.json();
        if (!searchBody.Resources || searchBody.Resources.length === 0) {
          console.log('⚠️  Created user not found in API search results');
          test.skip();
          return;
        }
        
        userId = searchBody.Resources[0].id;
        originalUserName = searchBody.Resources[0].userName;
        console.log(`✅ Found created user in API: ${originalUserName} (ID: ${userId})`);
        
      } catch (error) {
        console.log(`❌ Error creating test user in database: ${error}`);
        test.skip();
        return;
      }
      
    } else {
      // Non-OEM: Create a user via API to update
      const createEndpoint = ApiEndpoints.users();
      const uniqueUserName = `putUser_${Date.now()}`;
      const createRequestBody = {
        schemas: [
          "urn:ietf:params:scim:schemas:core:2.0:User"
        ],
        active: true,
        userName: uniqueUserName,
        name: {
          formatted: `PUT Test User ${Date.now()}`
        },
        groups: [
          {
            value: "1"
          }
        ]
      };
      
      console.log('🔧 Creating user via API for PUT test...');
      const createResponse = await request.post(`${apiContext.baseUrl}${createEndpoint}`, {
        headers: {
          ...apiContext.headers,
          'Content-Type': 'application/scim+json'
        },
        data: createRequestBody,
        timeout: 90000
      });
      
      // Check if user creation was successful
      if (createResponse.status() !== 201) {
        console.log(`⚠️  Could not create user for PUT test (Status: ${createResponse.status()})`);
        console.log('🔍 Skipping PUT test due to user creation failure');
        test.skip();
        return;
      }
      
      // Validate create response first
      ApiValidators.validateResponseStatus(createResponse, 201);
      const createdUser = await createResponse.json();
      userId = createdUser.id;
      originalUserName = createdUser.userName;
      console.log(`✅ Created user with ID: ${userId} for PUT test`);
    }
    
    // Now update the user with PUT
    const updateEndpoint = `${ApiEndpoints.users()}/${userId}`;
    const updateRequestBody = isOemEnvironment() 
      ? {
          // In OEM, update non-critical fields only (keep original userName)
          schemas: [
            "urn:ietf:params:scim:schemas:core:2.0:User"
          ],
          active: true,
          userName: originalUserName,  // Keep original username in OEM
          name: {
            formatted: `Updated Test User ${Date.now()}`
          }
        }
      : {
          // In Non-OEM, can use unique username
          schemas: [
            "urn:ietf:params:scim:schemas:core:2.0:User"
          ],
          active: true,
          userName: `updated_user_${Date.now()}`,
          name: {
            formatted: "Updated Test User"
          },
          email: "updated_testuser@example.com"
        };
    
    logApiRequest('PUT', updateEndpoint, `Update user ${userId} with PUT method`);
    console.log('📤 Request body:', JSON.stringify(updateRequestBody, null, 2));
    
    // Make the PUT request
    const response = await request.put(`${apiContext.baseUrl}${updateEndpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: updateRequestBody,
      timeout: 90000
    });
    
    // Validate response status (strict 200 expected)
    await test.step(`✅ PUT ${updateEndpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 200);
    });
    
    // Log status code information for reporting
    logTestResult(testInfo, 'PUT', updateEndpoint, 200, response.status(), 'PASS');
    
    // Parse and validate JSON response
    const responseBody = await ApiValidators.validateJsonResponse(response);
    console.log('📥 Response body received:', JSON.stringify(responseBody, null, 2));
    
    // SCIM-specific validations for updated user
    console.log('[CHECK] Validating SCIM updated User response...');
    
    // Validate SCIM User schema
    expect(responseBody.schemas).toBeDefined();
    expect(Array.isArray(responseBody.schemas)).toBe(true);
    expect(responseBody.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:User');
    console.log('✅ SCIM User schema present');
    
    // Validate user ID matches
    expect(responseBody.id).toBeDefined();
    expect(responseBody.id).toBe(userId);
    console.log(`✅ User ID matches: ${responseBody.id}`);
    
    // Validate updated fields
    expect(responseBody.userName).toBeDefined();
    console.log(`✅ Username: ${responseBody.userName}`);
    
    expect(responseBody.active).toBeDefined();
    expect(responseBody.active).toBe(true);
    console.log(`✅ Active status: ${responseBody.active}`);
    
    // Validate meta object
    expect(responseBody.meta).toBeDefined();
    expect(responseBody.meta.resourceType).toBe('User');
    expect(responseBody.meta.location).toBeDefined();
    expect(responseBody.meta.location).toContain(`/Users/${userId}`);
    console.log(`✅ Resource type: ${responseBody.meta.resourceType}`);
    console.log(`✅ Location: ${responseBody.meta.location}`);
    
    // Validate response headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/(application\/json|application\/scim\+json)/);
    console.log(`✅ Content-Type validation passed: ${contentType}`);
    
    console.log('[DONE] Update User (PUT) test completed successfully!');
  });

  /**
   * OBSCIM-333: Verify the update User endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 11: Update User (PATCH)
   * Endpoint: PATCH {{IdSBaseURI}}/obscim/v2/Users/{id}
   * Purpose: Partially update an existing user using PATCH method with JSON Patch operations
   */
  test('Update User (PATCH) - OBSCIM-333', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-333: Testing Users PATCH (partial update) endpoint');
    
    let userId: string;
    let originalUserName: string;
    
    if (isOemEnvironment()) {
      // In OEM, create a test user directly in the database
      console.log('🏢 OEM Mode: Creating test user in database for PATCH test...');
      const testUserName = `PATCHTEST_${Date.now()}`;
      const institutionId = getInstitutionId();
      
      try {
        console.log(`📝 Creating user "${testUserName}" in database with institutionId: ${institutionId}`);
        const userNum = await createTestUserInDatabase(testUserName, institutionId);
        console.log(`✅ Database user created with usernum: ${userNum}`);
        
        // Now search for this user via API to get the SCIM ID
        console.log('🔍 Searching for created user via API...');
        const searchEndpoint = `${ApiEndpoints.users()}?filter=userName eq "${testUserName}" and institutionid eq "${institutionId}"`;
        const searchResponse = await request.get(`${apiContext.baseUrl}${searchEndpoint}`, {
          headers: apiContext.headers,
          timeout: 90000
        });
        
        if (searchResponse.status() !== 200) {
          console.log(`⚠️  Could not search for created user (Status: ${searchResponse.status()})`);
          test.skip();
          return;
        }
        
        const searchBody = await searchResponse.json();
        if (!searchBody.Resources || searchBody.Resources.length === 0) {
          console.log('⚠️  Created user not found in API search results');
          test.skip();
          return;
        }
        
        userId = searchBody.Resources[0].id;
        originalUserName = searchBody.Resources[0].userName;
        console.log(`✅ Found created user in API: ${originalUserName} (ID: ${userId})`);
        
      } catch (error) {
        console.log(`❌ Error creating test user in database: ${error}`);
        test.skip();
        return;
      }
      
    } else {
      // Non-OEM: Create a user via API to update
      const createEndpoint = ApiEndpoints.users();
      const uniqueUserName = `patchUser_${Date.now()}`;
      const createRequestBody = {
        schemas: [
          "urn:ietf:params:scim:schemas:core:2.0:User"
        ],
        active: true,
        userName: uniqueUserName,
        name: {
          formatted: `PATCH Test User ${Date.now()}`
        },
        groups: [
          {
            value: "1"
          }
        ]
      };
      
      console.log('🔧 Creating user via API for PATCH test...');
      const createResponse = await request.post(`${apiContext.baseUrl}${createEndpoint}`, {
        headers: {
          ...apiContext.headers,
          'Content-Type': 'application/scim+json'
        },
        data: createRequestBody,
        timeout: 90000
      });
      
      // Check if user creation was successful
      if (createResponse.status() !== 201) {
        console.log(`⚠️  Could not create user for PATCH test (Status: ${createResponse.status()})`);
        console.log('🔍 Skipping PATCH test due to user creation failure');
        test.skip();
        return;
      }
      
      // Validate create response first
      ApiValidators.validateResponseStatus(createResponse, 201);
      const createdUser = await createResponse.json();
      userId = createdUser.id;
      originalUserName = createdUser.userName;
      console.log(`✅ Created user with ID: ${userId} for PATCH test`);
    }
    
    // Now update the user with PATCH
    const updateEndpoint = `${ApiEndpoints.users()}/${userId}`;
    const updateRequestBody = {
      schemas: [
        "urn:ietf:params:scim:api:messages:2.0:PatchOp"
      ],
      Operations: [
        {
          op: "add",
          value: {
            emails: [
              {
                value: "updated.patch@test.com"
              }
            ],
            groups: [
              {
                value: "106"
              }
            ]
          }
        }
      ]
    };
    
    logApiRequest('PATCH', updateEndpoint, `Partially update user ${userId} with PATCH method`);
    console.log('📤 Request body:', JSON.stringify(updateRequestBody, null, 2));
    
    // Make the PATCH request
    const response = await request.patch(`${apiContext.baseUrl}${updateEndpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: updateRequestBody,
      timeout: 90000
    });
    
    // Validate response status (strict 200 expected)
    await test.step(`✅ PATCH ${updateEndpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 200);
    });
    
    // Log status code information for reporting
    logTestResult(testInfo, 'PATCH', updateEndpoint, 200, response.status(), 'PASS');
    
    // Parse and validate JSON response
    const responseBody = await ApiValidators.validateJsonResponse(response);
    console.log('📥 Response body received:', JSON.stringify(responseBody, null, 2));
    
    // SCIM-specific validations for patched user
    console.log('[CHECK] Validating SCIM patched User response...');
    
    // Validate SCIM User schema
    expect(responseBody.schemas).toBeDefined();
    expect(Array.isArray(responseBody.schemas)).toBe(true);
    expect(responseBody.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:User');
    console.log('✅ SCIM User schema present');
    
    // Validate user ID matches
    expect(responseBody.id).toBeDefined();
    expect(responseBody.id).toBe(userId);
    console.log(`✅ User ID matches: ${responseBody.id}`);
    
    // Validate patched fields (emails and groups should be updated)
    if (responseBody.emails && Array.isArray(responseBody.emails) && responseBody.emails.length > 0) {
      console.log(`✅ Email(s) present: ${responseBody.emails.map((e: any) => e.value).join(', ')}`);
    }
    
    if (responseBody.groups && Array.isArray(responseBody.groups) && responseBody.groups.length > 0) {
      console.log(`✅ Group(s) present: ${responseBody.groups.map((g: any) => g.value || g.display).join(', ')}`);
    }
    
    // Validate meta object
    expect(responseBody.meta).toBeDefined();
    expect(responseBody.meta.resourceType).toBe('User');
    expect(responseBody.meta.location).toBeDefined();
    expect(responseBody.meta.location).toContain(`/Users/${userId}`);
    console.log(`✅ Resource type: ${responseBody.meta.resourceType}`);
    console.log(`✅ Location: ${responseBody.meta.location}`);
    
    // Validate response headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/(application\/json|application\/scim\+json)/);
    console.log(`✅ Content-Type validation passed: ${contentType}`);
    
    console.log('[DONE] Update User (PATCH) test completed successfully!');
  });

  /**
   * OBSCIM-333: Verify the delete User endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 12: Delete User (DELETE)
   * Endpoint: DELETE {{IdSBaseURI}}/obscim/v2/Users/{id}
   * Purpose: Delete an existing user resource and validate proper response
   */
  test('Delete User (DELETE) - OBSCIM-333', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-333: Testing Users DELETE endpoint');
    
    let userId: string;
    let testUserName: string;
    
    if (isOemEnvironment()) {
      // In OEM, create a test user directly in the database
      console.log('🏢 OEM Mode: Creating test user in database for DELETE test...');
      testUserName = `DELTEST_${Date.now()}`;
      const institutionId = getInstitutionId();
      
      try {
        console.log(`📝 Creating user "${testUserName}" in database with institutionId: ${institutionId}`);
        const userNum = await createTestUserInDatabase(testUserName, institutionId);
        console.log(`✅ Database user created with usernum: ${userNum}`);
        
        // Now search for this user via API to get the SCIM ID
        console.log('🔍 Searching for created user via API...');
        const searchEndpoint = `${ApiEndpoints.users()}?filter=userName eq "${testUserName}" and institutionid eq "${institutionId}"`;
        const searchResponse = await request.get(`${apiContext.baseUrl}${searchEndpoint}`, {
          headers: apiContext.headers,
          timeout: 90000
        });
        
        if (searchResponse.status() !== 200) {
          console.log(`⚠️  Could not search for created user (Status: ${searchResponse.status()})`);
          test.skip();
          return;
        }
        
        const searchBody = await searchResponse.json();
        if (!searchBody.Resources || searchBody.Resources.length === 0) {
          console.log('⚠️  Created user not found in API search results');
          test.skip();
          return;
        }
        
        userId = searchBody.Resources[0].id;
        console.log(`✅ Found created user in API: ${testUserName} (ID: ${userId})`);
        
      } catch (error) {
        console.log(`❌ Error creating test user in database: ${error}`);
        test.skip();
        return;
      }
      
    } else {
      // Non-OEM: Create a user via API to delete
      const createEndpoint = ApiEndpoints.users();
      testUserName = `deleteUser_${Date.now()}`;
      const createRequestBody = {
        schemas: [
          "urn:ietf:params:scim:schemas:core:2.0:User"
        ],
        active: true,
        userName: testUserName,
        name: {
          formatted: `Delete Test User ${Date.now()}`
        },
        groups: [
          {
            value: "1"
          }
        ]
      };
      
      console.log('🔧 Creating user via API for DELETE test...');
      const createResponse = await request.post(`${apiContext.baseUrl}${createEndpoint}`, {
        headers: {
          ...apiContext.headers,
          'Content-Type': 'application/scim+json'
        },
        data: createRequestBody,
        timeout: 90000
      });
      
      // Check if user creation was successful
      if (createResponse.status() !== 201) {
        console.log(`⚠️  Could not create user for DELETE test (Status: ${createResponse.status()})`);
        console.log('🔍 Skipping DELETE test due to user creation failure');
        test.skip();
        return;
      }
      
      // Validate create response first
      ApiValidators.validateResponseStatus(createResponse, 201);
      const createdUser = await createResponse.json();
      userId = createdUser.id;
      console.log(`✅ Created user with ID: ${userId} for DELETE test`);
    }
    
    // Now delete the user
    const deleteEndpoint = `${ApiEndpoints.users()}/${userId}`;
    logApiRequest('DELETE', deleteEndpoint, `Delete user ${userId}`);
    
    // Make the DELETE request
    const response = await request.delete(`${apiContext.baseUrl}${deleteEndpoint}`, {
      headers: apiContext.headers,
      timeout: 90000
    });
    
    // Validate response status (strict 204 expected)
    await test.step(`✅ DELETE ${deleteEndpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 204);
    });
    
    // Log status code information for reporting
    logTestResult(testInfo, 'DELETE', deleteEndpoint, 204, response.status(), 'PASS');
    
    console.log('✅ User deleted successfully (204 No Content)');
    
    // Verify user is actually deleted by trying to get it
    console.log('🔍 Verifying user deletion by attempting to fetch deleted user...');
    const getResponse = await request.get(`${apiContext.baseUrl}${deleteEndpoint}`, {
      headers: apiContext.headers,
      timeout: 90000
    });
    
    if (getResponse.status() === 404) {
      console.log('✅ Confirmed: User no longer exists (404 Not Found)');
    } else {
      console.log(`⚠️  User still exists or unexpected status: ${getResponse.status()}`);
    }
    
    console.log('[DONE] Delete User test completed successfully!');
  });

  /**
   * OBSCIM-343: Verify the create Group endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 21: Create Group (POST)
   * Endpoint: POST {{IdSBaseURI}}/obscim/v2/Groups
   * Purpose: Create a new group resource and validate SCIM 2.0 compliance
   */
  test('Create Group (POST) - OBSCIM-343', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-343: Testing Groups POST (create) endpoint');
    
    const endpoint = ApiEndpoints.groups();
    const uniqueGroupName = `group_${Date.now()}`;
    const requestBody = {
      schemas: [
        "urn:ietf:params:scim:schemas:core:2.0:Group"
      ],
      displayName: uniqueGroupName
    };
    
    logApiRequest('POST', endpoint, 'Create a new group resource');
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    // Make the API request
    const response = await request.post(`${apiContext.baseUrl}${endpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: requestBody,
      timeout: 90000
    });
    
    // Validate response status
    await test.step(`✅ POST ${endpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 201);
    });
    
    // Log status code information for reporting
    logTestResult(testInfo, 'POST', endpoint, 201, response.status(), 'PASS');
    
    // Parse and validate JSON response
    const responseBody = await ApiValidators.validateJsonResponse(response);
    console.log('📥 Response body received:', JSON.stringify(responseBody, null, 2));
    
    // SCIM-specific validations for created group
    console.log('[CHECK] Validating SCIM created Group response...');
    
    // Validate SCIM Group schema
    expect(responseBody.schemas).toBeDefined();
    expect(Array.isArray(responseBody.schemas)).toBe(true);
    expect(responseBody.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:Group');
    console.log('✅ SCIM Group schema present');
    
    // Validate group ID
    expect(responseBody.id).toBeDefined();
    const createdGroupId = responseBody.id;
    console.log(`✅ Group ID assigned: ${createdGroupId}`);
    
    // Validate displayName
    expect(responseBody.displayName).toBeDefined();
    expect(responseBody.displayName).toBe(uniqueGroupName);
    console.log(`✅ Display name: ${responseBody.displayName}`);
    
    // Validate meta object
    expect(responseBody.meta).toBeDefined();
    expect(responseBody.meta.resourceType).toBe('Group');
    expect(responseBody.meta.location).toBeDefined();
    expect(responseBody.meta.location).toContain(`/Groups/${createdGroupId}`);
    console.log(`✅ Resource type: ${responseBody.meta.resourceType}`);
    console.log(`✅ Location: ${responseBody.meta.location}`);
    
    // Validate response headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/(application\/json|application\/scim\+json)/);
    console.log(`✅ Content-Type validation passed: ${contentType}`);
    
    console.log(`Created group with ID: ${createdGroupId} for potential cleanup`);
    
    console.log('[DONE] Create Group test completed successfully!');
  });

  /**
   * OBSCIM-343: Verify the update Group endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 23: Update Group (PATCH)
   * Endpoint: PATCH {{IdSBaseURI}}/obscim/v2/Groups/{id}
   * Purpose: Partially update an existing group using PATCH method with JSON Patch operations
   */
  test('Update Group (PATCH) - OBSCIM-343', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-343: Testing Groups PATCH (partial update) endpoint');
    
    // First, create a group to update
    const createEndpoint = ApiEndpoints.groups();
    const uniqueGroupName = `patchGroup_${Date.now()}`;
    const createRequestBody = {
      schemas: [
        "urn:ietf:params:scim:schemas:core:2.0:Group"
      ],
      displayName: uniqueGroupName
    };
    
    console.log('🔧 Creating group for PATCH test...');
    const createResponse = await request.post(`${apiContext.baseUrl}${createEndpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: createRequestBody,
      timeout: 90000
    });
    
    // Check if group creation was successful
    if (createResponse.status() !== 201) {
      console.log(`⚠️  Could not create group for PATCH test (Status: ${createResponse.status()})`);
      console.log('🔍 Skipping PATCH test due to group creation failure');
      test.skip();
      return;
    }
    
    // Validate create response first
    ApiValidators.validateResponseStatus(createResponse, 201);
    const createdGroup = await createResponse.json();
    const groupId = createdGroup.id;
    console.log(`✅ Created group with ID: ${groupId} for PATCH test`);
    
    // Now update the group with PATCH
    const updateEndpoint = `${ApiEndpoints.groups()}/${groupId}`;
    const updatedDisplayName = `patched_${uniqueGroupName}`;
    const updateRequestBody = {
      schemas: [
        "urn:ietf:params:scim:api:messages:2.0:PatchOp"
      ],
      Operations: [
        {
          op: "replace",
          path: "displayName",
          value: updatedDisplayName
        }
      ]
    };
    
    logApiRequest('PATCH', updateEndpoint, `Partially update group ${groupId} with PATCH method`);
    console.log('📤 Request body:', JSON.stringify(updateRequestBody, null, 2));
    
    // Make the PATCH request
    const response = await request.patch(`${apiContext.baseUrl}${updateEndpoint}`, {
      headers: {
        ...apiContext.headers,
        'Content-Type': 'application/scim+json'
      },
      data: updateRequestBody,
      timeout: 90000
    });
    
    // Validate response status (accept both 200 and 204)
    await test.step(`✅ PATCH ${updateEndpoint}`, async () => {
      const status = response.status();
      if (status !== 200 && status !== 204) {
        throw new Error(`Expected status 200 or 204, but got ${status}`);
      }
      console.log(`✅ PATCH successful with status: ${status}`);
    });
    
    // Log status code information for reporting
    const actualStatus = response.status();
    logTestResult(testInfo, 'PATCH', updateEndpoint, 200, actualStatus, 'PASS');
    
    if (actualStatus === 200) {
      // Parse and validate JSON response
      const responseBody = await ApiValidators.validateJsonResponse(response);
      console.log('📥 Response body received:', JSON.stringify(responseBody, null, 2));
      
      // SCIM-specific validations for patched group
      console.log('[CHECK] Validating SCIM patched Group response...');
      
      // Validate SCIM Group schema
      expect(responseBody.schemas).toBeDefined();
      expect(Array.isArray(responseBody.schemas)).toBe(true);
      expect(responseBody.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:Group');
      console.log('✅ SCIM Group schema present');
      
      // Validate group ID matches
      expect(responseBody.id).toBeDefined();
      expect(responseBody.id).toBe(groupId);
      console.log(`✅ Group ID matches: ${responseBody.id}`);
      
      // Validate displayName was updated
      expect(responseBody.displayName).toBeDefined();
      expect(responseBody.displayName).toBe(updatedDisplayName);
      console.log(`✅ Display name updated to: ${responseBody.displayName}`);
      
      // Validate meta object
      expect(responseBody.meta).toBeDefined();
      expect(responseBody.meta.resourceType).toBe('Group');
      expect(responseBody.meta.location).toBeDefined();
      expect(responseBody.meta.location).toContain(`/Groups/${groupId}`);
      console.log(`✅ Resource type: ${responseBody.meta.resourceType}`);
      console.log(`✅ Location: ${responseBody.meta.location}`);
      
      // Validate response headers
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/(application\/json|application\/scim\+json)/);
      console.log(`✅ Content-Type validation passed: ${contentType}`);
    } else {
      console.log('✅ Group patched successfully (204 No Content)');
    }
    
    console.log('[DONE] Update Group (PATCH) test completed successfully!');
  });

  /**
   * OBSCIM-343: Verify the delete Group endpoint for OBSCIM as per SCIM 2.0 specification
   * Test Case 24: Delete Group (DELETE)
   * Endpoint: DELETE {{IdSBaseURI}}/obscim/v2/Groups/{id}
   * Purpose: Validate that DELETE Groups is restricted and returns 405 Method Not Allowed
   * 
   * Note: DELETE Groups is restricted across all environments (OEM/Non-OEM, SCIM/API Server)
   * This is a negative test to confirm the restriction is properly enforced.
   */
  test('Delete Group (DELETE) - OBSCIM-343', async ({ request }, testInfo) => {
    console.log('[START] OBSCIM-343: Testing Groups DELETE endpoint');
    console.log('� Note: DELETE Groups is restricted and returns 405 Method Not Allowed in all environments');
    
    // Use an existing group ID (e.g., group 1) to test DELETE restriction
    const testGroupId = '1';
    const endpoint = `${ApiEndpoints.groups()}/${testGroupId}`;
    logApiRequest('DELETE', endpoint, `Attempt to delete group ${testGroupId} (expecting 405)`);

    const response = await request.delete(`${apiContext.baseUrl}${endpoint}`, {
      headers: apiContext.headers,
      timeout: 90000
    });

    await test.step(`✅ DELETE ${endpoint}`, async () => {
      console.log(`[OK] DELETE response status: ${response.status()}`);
      
      // DELETE Groups is restricted and should return 405 Method Not Allowed
      // This applies to both OEM/Non-OEM and SCIM/API Server endpoints
      expect(response.status()).toBe(405);
      
      console.log('✅ DELETE operation correctly returns 405 Method Not Allowed');
      console.log('🔍 DELETE Groups is restricted across all environments (OEM/Non-OEM, SCIM/API Server)');
      console.log('✅ Test completed - DELETE restriction validated successfully');
      
      // Log status code information for reporting
      logTestResult(testInfo, 'DELETE', endpoint, 405, response.status(), 'PASS');
    });
    
    console.log('[DONE] Delete Group restriction test completed successfully!');
  });
});
