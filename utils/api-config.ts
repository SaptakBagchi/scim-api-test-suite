/**
 * API Test Utilities and Configuration
 * Handles authentication and API endpoint configuration
 */

/**
 * API endpoint types supported by the project
 */
export type ApiEndpointType = 'scim' | 'apiserver';

/**
 * Project-level configuration from environment variables
 * Using getters to ensure dynamic reads from process.env (for OEM switching)
 */
export const ProjectConfig = {
  oauth: {
    get baseUrl() {
      return process.env.OAUTH_BASE_URL || 'https://rdv-010318.hylandqa.net/identityservice';
    },
    get tokenEndpoint() {
      return process.env.OAUTH_TOKEN_ENDPOINT || '/connect/token';
    },
    get clientId() {
      return process.env.CLIENT_ID || '';
    },
    get clientSecret() {
      return process.env.CLIENT_SECRET || '';
    },
    get defaultScope() {
      return process.env.DEFAULT_SCOPE || 'idpadmin';
    },
    get defaultGrantType() {
      return process.env.DEFAULT_GRANT_TYPE || 'client_credentials';
    }
  },
  api: {
    get baseUrl() {
      return process.env.API_BASE_URL || 'https://rdv-010318.hylandqa.net';
    },
    // Current endpoint type: 'scim' or 'apiserver'
    // Check both ENDPOINT_TYPE and API_ENDPOINT_TYPE for backwards compatibility
    get endpointType(): ApiEndpointType {
      return ((process.env.ENDPOINT_TYPE || process.env.API_ENDPOINT_TYPE) as ApiEndpointType) || 'scim';
    },
    // Base paths for different endpoint types
    endpoints: {
      get scim() {
        return process.env.API_SCIM_ENDPOINT || '/obscim/v2';
      },
      get apiserver() {
        return process.env.API_APISERVER_ENDPOINT || '/ApiServer/onbase/SCIM/v2';
      }
    }
  },
  timeouts: {
    get api() {
      return parseInt(process.env.API_TIMEOUT || '30000');
    },
    get request() {
      return parseInt(process.env.REQUEST_TIMEOUT || '10000');
    }
  }
};

/**
 * OAuth2 Token Response interface
 */
export interface OAuth2TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * API Test Context interface - contains authentication and base configuration
 */
export interface ApiTestContext {
  accessToken: string;
  baseUrl: string;
  headers: Record<string, string>;
}

/**
 * Authentication utility - generates OAuth2 token for API tests
 */
export async function getAuthToken(request: any): Promise<OAuth2TokenResponse> {
  console.log('[KEY] Getting OAuth2 authentication token...');
  
  const formData = new URLSearchParams();
  formData.append('grant_type', ProjectConfig.oauth.defaultGrantType);
  formData.append('scope', ProjectConfig.oauth.defaultScope);
  formData.append('client_id', ProjectConfig.oauth.clientId);
  formData.append('client_secret', ProjectConfig.oauth.clientSecret);
  
  const tokenUrl = `${ProjectConfig.oauth.baseUrl}${ProjectConfig.oauth.tokenEndpoint}`;
  console.log(`[URL] Token URL: ${tokenUrl}`);
  
  const response = await request.post(tokenUrl, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    data: formData.toString(),
    timeout: ProjectConfig.timeouts.request
  });
  
  if (response.status() !== 200) {
    const errorBody = await response.text();
    throw new Error(`Authentication failed: ${response.status()} - ${errorBody}`);
  }
  
  const tokenData = await response.json();
  console.log(`[OK] Token obtained successfully (expires in ${tokenData.expires_in} seconds)`);
  
  return tokenData;
}

/**
 * Create API test context with authentication
 */
export async function createApiTestContext(request: any): Promise<ApiTestContext> {
  // Validate endpoint configuration before proceeding
  validateEndpointConfiguration();
  
  const tokenResponse = await getAuthToken(request);
  
  const context: ApiTestContext = {
    accessToken: tokenResponse.access_token,
    baseUrl: ProjectConfig.api.baseUrl,
    headers: {
      'Authorization': `Bearer ${tokenResponse.access_token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Playwright-SCIM-API-Tests/1.0'
    }
  };
  
  console.log(`[START] API test context created for base URL: ${context.baseUrl}`);
  logEndpointConfiguration();
  return context;
}

/**
 * Get the current active endpoint path based on configuration
 */
export function getCurrentEndpointPath(): string {
  return ProjectConfig.api.endpoints[ProjectConfig.api.endpointType];
}

/**
 * Get the current endpoint type being used
 */
export function getCurrentEndpointType(): ApiEndpointType {
  return ProjectConfig.api.endpointType;
}

/**
 * Utility function to log current endpoint configuration
 */
export function logEndpointConfiguration(): void {
  console.log('[SETUP] API Endpoint Configuration:');
  console.log(`[URL] Current Type: ${getCurrentEndpointType().toUpperCase()}`);
  console.log(`[WEB] Base URL: ${ProjectConfig.api.baseUrl}`);
  console.log(`[FOLDER] Endpoint Path: ${getCurrentEndpointPath()}`);
  console.log(`[OK] Full URL: ${ProjectConfig.api.baseUrl}${getCurrentEndpointPath()}`);
}

/**
 * Utility function to validate endpoint configuration
 */
export function validateEndpointConfiguration(): void {
  const currentType = ProjectConfig.api.endpointType;
  const availableTypes: ApiEndpointType[] = ['scim', 'apiserver'];
  
  if (!availableTypes.includes(currentType)) {
    throw new Error(`Invalid API_ENDPOINT_TYPE: ${currentType}. Must be one of: ${availableTypes.join(', ')}`);
  }
  
  const currentPath = getCurrentEndpointPath();
  if (!currentPath) {
    throw new Error(`Endpoint path not configured for type: ${currentType}`);
  }
}

/**
 * API endpoint builders
 */
export const ApiEndpoints = {
  // SCIM v2 endpoints (works for both scim and apiserver)
  resourceTypes: () => `${getCurrentEndpointPath()}/ResourceTypes`,
  users: () => `${getCurrentEndpointPath()}/Users`,
  groups: () => `${getCurrentEndpointPath()}/Groups`,
  schemas: () => `${getCurrentEndpointPath()}/Schemas`,
  serviceProviderConfig: () => `${getCurrentEndpointPath()}/ServiceProviderConfig`,
  
  // SCIM v4.0.0 endpoints (alternative paths)
  resourceTypesV4: () => `/ResourceTypes`,
  schemasV4: () => `/Schemas`,
  serviceProviderConfigV4: () => `/ServiceProviderConfig`,
  
  // Search endpoints
  userSearch: () => `${getCurrentEndpointPath()}/Users/.search`,
  groupSearch: () => `${getCurrentEndpointPath()}/Groups/.search`,
  
  // Health check endpoints (context-aware for SCIM vs API Server)
  healthcheck: () => getCurrentEndpointType() === 'scim' ? `/obscim/healthcheck` : `/healthcheck`,
  diagnostics: () => getCurrentEndpointType() === 'scim' ? `/obscim/diagnostics/details` : `/diagnostics/details`,
  
  // Custom endpoint builder
  custom: (endpoint: string) => endpoint.startsWith('/') ? endpoint : `/${endpoint}`
};

/**
 * SCIM Schema Constants
 */
export const ScimSchemas = {
  USER: 'urn:ietf:params:scim:schemas:core:2.0:User',
  GROUP: 'urn:ietf:params:scim:schemas:core:2.0:Group',
  LIST_RESPONSE: 'urn:ietf:params:scim:api:messages:2.0:ListResponse',
  SEARCH_REQUEST: 'urn:ietf:params:scim:api:messages:2.0:SearchRequest',
  PATCH_OP: 'urn:ietf:params:scim:api:messages:2.0:PatchOp',
  ERROR: 'urn:ietf:params:scim:api:messages:2.0:Error',
  SERVICE_PROVIDER_CONFIG: 'urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig',
  SCHEMA: 'urn:ietf:params:scim:schemas:core:2.0:Schema',
  RESOURCE_TYPE: 'urn:ietf:params:scim:schemas:core:2.0:ResourceType'
} as const;

/**
 * Utility function to log API request details
 */
export function logApiRequest(method: string, endpoint: string, description?: string): void {
  console.log(`[WEB] ${method.toUpperCase()} Request: ${endpoint}`);
  if (description) console.log(`[NOTE] Description: ${description}`);
}

/**
 * Response validation utilities
 */
export const ApiValidators = {
  validateResponseStatus: (response: any, expectedStatus: number = 200) => {
    if (response.status() !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status()}`);
    }
    console.log(`[OK] Response status validation passed (${response.status()})`);
  },
  
  validateJsonResponse: async (response: any) => {
    try {
      const body = await response.json();
      console.log('[OK] Valid JSON response received');
      return body;
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error}`);
    }
  },
  
  validateScimResponse: (responseBody: any, resourceType?: string) => {
    // Basic SCIM response validation
    if (!responseBody.schemas || !Array.isArray(responseBody.schemas)) {
      throw new Error('SCIM response missing schemas array');
    }
    
    if (resourceType && responseBody.meta?.resourceType !== resourceType) {
      throw new Error(`Expected resourceType ${resourceType}, got ${responseBody.meta?.resourceType}`);
    }
    
    console.log('[OK] SCIM response validation passed');
  },

  /**
   * Validate response time is within acceptable limits
   * Industry standard: API responses should be under 2000ms for good UX
   */
  validateResponseTime: (startTime: number, maxTimeMs: number = 2000, operationName: string = 'API call') => {
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);
    
    if (responseTime > maxTimeMs) {
      console.log(`⚠️  Warning: ${operationName} took ${responseTime}ms (exceeds ${maxTimeMs}ms threshold)`);
    } else {
      console.log(`[OK] Response time acceptable (< ${maxTimeMs}ms)`);
    }
    
    return responseTime;
  },

  /**
   * Validate required fields exist in response
   */
  validateRequiredFields: (responseBody: any, requiredFields: string[], objectName: string = 'Response') => {
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      if (responseBody[field] === undefined || responseBody[field] === null) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      throw new Error(`${objectName} missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log(`[OK] All required fields present in ${objectName}`);
  },

  /**
   * Validate field types match expected types
   */
  validateFieldTypes: (responseBody: any, fieldTypes: Record<string, string>) => {
    const typeErrors: string[] = [];
    
    Object.entries(fieldTypes).forEach(([field, expectedType]) => {
      const actualType = typeof responseBody[field];
      if (actualType !== expectedType && responseBody[field] !== undefined) {
        typeErrors.push(`${field}: expected ${expectedType}, got ${actualType}`);
      }
    });
    
    if (typeErrors.length > 0) {
      throw new Error(`Type validation failed: ${typeErrors.join('; ')}`);
    }
    
    console.log('[OK] All field types match expected types');
  }
};

/**
 * Test-level parameter interface for OAuth2 tests
 */
export interface OAuth2TestParams {
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
  additional_params?: Record<string, string>;
  expected_status?: number;
  test_description?: string;
}

/**
 * Default test parameters - can be overridden at test level
 */
export const DefaultTestParams: OAuth2TestParams = {
  grant_type: ProjectConfig.oauth.defaultGrantType,
  scope: ProjectConfig.oauth.defaultScope,
  client_id: ProjectConfig.oauth.clientId,
  client_secret: ProjectConfig.oauth.clientSecret,
  expected_status: 200
};

/**
 * Test scenarios for parameterized testing
 */
export const TestScenarios = {
  validCredentials: {
    ...DefaultTestParams,
    test_description: 'Valid client credentials flow'
  },
  
  invalidSecret: {
    ...DefaultTestParams,
    client_secret: 'invalid_secret_12345',
    expected_status: 400,
    test_description: 'Invalid client secret'
  },
  
  missingSecret: {
    grant_type: DefaultTestParams.grant_type,
    scope: DefaultTestParams.scope,
    client_id: DefaultTestParams.client_id,
    // client_secret intentionally missing
    expected_status: 400,
    test_description: 'Missing client secret'
  },
  
  invalidGrantType: {
    ...DefaultTestParams,
    grant_type: 'invalid_grant_type',
    expected_status: 400,
    test_description: 'Invalid grant type'
  },
  
  differentScope: {
    ...DefaultTestParams,
    scope: 'read write',
    test_description: 'Different scope permissions'
  },
  
  emptyScope: {
    ...DefaultTestParams,
    scope: '',
    expected_status: 400,
    test_description: 'Empty scope parameter'
  }
};

/**
 * Utility function to create OAuth2 request payload
 */
export function createOAuth2Payload(params: OAuth2TestParams): URLSearchParams {
  const formData = new URLSearchParams();
  
  if (params.grant_type) formData.append('grant_type', params.grant_type);
  if (params.scope) formData.append('scope', params.scope);
  if (params.client_id) formData.append('client_id', params.client_id);
  if (params.client_secret) formData.append('client_secret', params.client_secret);
  
  // Add any additional parameters
  if (params.additional_params) {
    Object.entries(params.additional_params).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return formData;
}

/**
 * Utility function to get full OAuth2 token URL
 */
export function getTokenUrl(): string {
  return `${ProjectConfig.oauth.baseUrl}${ProjectConfig.oauth.tokenEndpoint}`;
}

/**
 * Utility function to log test parameters (with sensitive data hidden)
 */
export function logTestParams(params: OAuth2TestParams): void {
  console.log('[NOTE] Test parameters:');
  console.log(`  - Description: ${params.test_description || 'No description'}`);
  console.log(`  - Grant Type: ${params.grant_type || 'Not specified'}`);
  console.log(`  - Scope: ${params.scope || 'Not specified'}`);
  console.log(`  - Client ID: ${params.client_id || 'Not specified'}`);
  console.log(`  - Client Secret: ${params.client_secret ? '[SET]' : '[NOT SET]'}`);
  console.log(`  - Expected Status: ${params.expected_status || 'Not specified'}`);
  
  if (params.additional_params && Object.keys(params.additional_params).length > 0) {
    console.log(`  - Additional Params: ${Object.keys(params.additional_params).join(', ')}`);
  }
}

/**
 * Response validation utilities
 */
export const ResponseValidators = {
  validateSuccessResponse: (responseBody: any) => {
    const requiredFields = ['access_token', 'expires_in', 'token_type', 'scope'];
    const missingFields = requiredFields.filter(field => !(field in responseBody));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in response: ${missingFields.join(', ')}`);
    }
    
    // Validate token structure (JWT should have 3 parts)
    if (responseBody.access_token) {
      const tokenParts = responseBody.access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Access token does not appear to be a valid JWT structure');
      }
    }
    
    // Validate expires_in is reasonable
    if (responseBody.expires_in && (responseBody.expires_in <= 0 || responseBody.expires_in > 86400)) {
      throw new Error(`Token expiration time is unreasonable: ${responseBody.expires_in} seconds`);
    }
  },
  
  validateErrorResponse: (responseBody: any) => {
    if (!responseBody.error) {
      throw new Error('Expected error field in error response');
    }
  }
};