/**
 * SCIM API Test Framework - Example Test Template
 * 
 * This is a template showing how to use the SCIM API test framework.
 * For actual test implementations, see the 'develop' or 'poc' branches.
 * 
 * Framework Components:
 * - utils/api-config.ts: API configuration and authentication
 * - utils/db-config.ts: Database operations (optional)
 * - global-setup.ts: Global test setup
 * - playwright.config.ts: Playwright configuration
 */

import { test, expect } from '@playwright/test';
import { createApiTestContext, ApiTestContext, ApiEndpoints, ApiValidators, logApiRequest } from '../utils/api-config';

test.describe('SCIM API Example Tests', () => {
  let apiContext: ApiTestContext;
  
  // Setup authentication before running tests
  test.beforeAll(async ({ request }) => {
    console.log('[SETUP] Setting up API authentication...');
    apiContext = await createApiTestContext(request);
    console.log('[OK] Authentication setup complete');
  });

  test.beforeEach(async () => {
    console.log('[TEST] Test Setup:');
    console.log(`[URL] Base URL: ${apiContext.baseUrl}`);
    console.log('[KEY] Authorization: Bearer [TOKEN_SET]');
    console.log('---');
  });

  /**
   * Example Test 1: Get Resource Types
   * Shows basic GET request pattern
   */
  test('Example: Get Resource Types', async ({ request }) => {
    const endpoint = ApiEndpoints.resourceTypes();
    logApiRequest('GET', endpoint, 'Retrieve all available SCIM resource types');
    
    // Make the API request
    const response = await request.get(`${apiContext.baseUrl}${endpoint}`, {
      headers: apiContext.headers,
      timeout: 30000
    });
    
    // Validate response status
    await test.step(`[OK] GET ${endpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 200);
    });
    
    // Parse and validate JSON response
    const responseBody = await ApiValidators.validateJsonResponse(response);
    
    // SCIM-specific validations
    console.log('[CHECK] Validating SCIM Resource Types response...');
    expect(responseBody.schemas).toBeDefined();
    expect(Array.isArray(responseBody.schemas)).toBe(true);
    console.log('[OK] SCIM schemas array present');
    
    expect(responseBody.totalResults).toBeDefined();
    console.log(`[OK] Total results: ${responseBody.totalResults}`);
    
    expect(responseBody.Resources).toBeDefined();
    expect(Array.isArray(responseBody.Resources)).toBe(true);
    console.log(`[OK] Resources array contains ${responseBody.Resources.length} items`);
    
    console.log('[DONE] Example test completed successfully!');
  });

  /**
   * Example Test 2: Get All Users
   * Shows pagination handling
   */
  test('Example: Get All Users', async ({ request }) => {
    const endpoint = ApiEndpoints.users();
    logApiRequest('GET', endpoint, 'Retrieve all users in the system');
    
    const response = await request.get(`${apiContext.baseUrl}${endpoint}`, {
      headers: apiContext.headers,
      timeout: 30000
    });
    
    await test.step(`[OK] GET ${endpoint}`, async () => {
      ApiValidators.validateResponseStatus(response, 200);
    });
    
    const responseBody = await ApiValidators.validateJsonResponse(response);
    
    // Validate SCIM list response structure
    console.log('[CHECK] Validating SCIM Users list response...');
    expect(responseBody.schemas).toBeDefined();
    expect(responseBody.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
    console.log('[OK] SCIM ListResponse schema present');
    
    expect(responseBody.totalResults).toBeDefined();
    console.log(`[OK] Total results: ${responseBody.totalResults}`);
    
    expect(responseBody.Resources).toBeDefined();
    expect(Array.isArray(responseBody.Resources)).toBe(true);
    console.log(`[OK] Resources array contains ${responseBody.Resources.length} users`);
    
    console.log('[DONE] Example test completed!');
  });
});
